require 'angular-ga/ga.js'
require './app-constant'
require './app-service'
require './app-router'

require('ngtemplate?relativeTo=templates/!html!jade-html!../jade/templates/info.jade')
require('ngtemplate?relativeTo=templates/!html!jade-html!../jade/templates/column.jade')

require('ngtemplate?relativeTo=errors/!html!jade-html!../jade/errors/no-ethercalc.jade')
require('ngtemplate?relativeTo=errors/!html!jade-html!../jade/errors/no-doc-info.jade')
require('ngtemplate?relativeTo=errors/!html!jade-html!../jade/errors/not-shared.jade')
require('ngtemplate?relativeTo=errors/!html!jade-html!../jade/errors/error.jade')

const IS_PRERENDERING = typeof(__prerender) is \function

angular.module \app.controller, <[app.constant app.service ga app.router]>
.controller \AppCtrl, <[
       TableData Spy  State  EtherCalcData  $anchorScroll  $timeout  ERRORS  $modal  $window  $routeParams  Column  $scope
]> ++ (data,     Spy, State, EtherCalcData, $anchorScroll, $timeout, ERRORS, $modal, $window, $routeParams, Column, $scope)!->

  data.then (d) ~>
    if $routeParams.perspective
      @data.perspectives = @data.perspectives.filter (perspective) ->
        perspective.title == $routeParams.perspective

    # Go to anchor if there is one after all data is loaded
    $timeout ->
      $anchorScroll!

    # If window.__prerender exists, invoke it
    if IS_PRERENDERING
      $window.__prerender $window

    # If there is no columns included, show all columns by default
    #
    if Column.size() == 0
      Column.set([''+i for i from 0 to d.positionTitle.length-1])

    @data = d
    $scope.$digest!

  .catch (reason) ~>

    # Error handling
    #
    templateUrl = switch reason
    case ERRORS.NO_ETHERCALC
      'no-ethercalc.jade'
    case ERRORS.NO_DOC_INFO
      'no-doc-info.jade'
    case ERRORS.NOT_SHARED
      'not-shared.jade'
    default
      'error.jade'

    $modal.open do
      templateUrl: templateUrl
      controller: 'ErrorModalCtrl as ErrorModal'
      resolve: do
        reason: reason

  @State = State

  EtherCalcData.then (data) !~>
    @EDIT_URL = data.EDIT_URL
    @TITLE = data.TITLE
    @LAYOUT_TYPE = data.TYPE
    @EMPHASIZE_NO_REF = data.EMPHASIZE_NO_REF

  @Column = Column

  @filterColumns = (val, idx, arr) ~>
    Column.includes(''+idx)

  @openColumnModal = ->
    $modal.open do
      templateUrl: 'column.jade'
      controller: 'ColumnModalCtrl as ColumnModal'

.controller \ErrorModalCtrl, <[
       $window  $routeParams  reason  EtherCalcData
]> ++ ($window, $routeParams, reason, EtherCalcData) !->

  @id = $routeParams.id
  @reason = JSON.stringify(reason)

  EtherCalcData.then (data) !~>
    @ethercalcData = data

  @handleHomeButton = (e) !~>
    # Forces a full-page reload,
    # or the factories does not get initialized correctly.
    #
    $window.location.href = '/'


.controller \WelcomeCtrl, <[
       VisitHistory  $http  $window
]> ++ (VisitHistory, $http, $window)!->
  @history-records = ^^VisitHistory.get!

  # Prepare scope.historyRecords
  for let record, idx in @history-records
    @history-records[idx].time-str = new Date(record.time).toLocaleString!

    resp <~ $http.get "https://www.googleapis.com/drive/v2/files/#{record.doc-id}?fields=thumbnailLink&key=#{GOOGLE_API_KEY}" .then
    @history-records[idx].style = do
      'background-image': "url(#{resp.data.thumbnail-link})"

  @handleClick = (e, key) !~>
    # Forces a full-page reload,
    # or the factories does not get initialized correctly.
    #
    e.prevent-default!
    $window.location.href = '/' + key


.controller \HeaderCtrl, <[
       Spy  State  $scope  $anchorScroll  $location  $modal  ga  HtmlDecoder  $routeParams  VisitHistory
]> ++ (Spy, State, $scope, $anchorScroll, $location, $modal, ga, HtmlDecoder, $routeParams, VisitHistory)!->

  @Spy = Spy

  # Scroll to specified title
  @scroll-to = (e, title) !->
    e.prevent-default!
    $location.hash title
    $anchorScroll!

  $scope.$watch (-> Spy.current), !->
    # Switch to title view (hide the buttons) in titlebar when scrollspy changes
    State.titlebar = \title

    # Send pageview event to google analytics
    unless Spy.current is null
      title = HtmlDecoder Spy.spies[Spy.current]
      ga \send, \pageview, {title}

  @open-info-modal = !->
    $modal.open do
      templateUrl: 'info.jade'
      controller: 'ModalCtrl as Modal'

  # Setup @labelAction
  do ~!function write-label-action
    @label-action =
      if State.labels # label is "on" now.
        "按一下隱藏"
      else
        "按一下顯示"

  # Toggle the label state on / off
  @toggle-labels = ->
    State.$cycle \labels
    write-label-action!

  # During page load, show the info modal for users that visits the table for the first time
  #
  unless VisitHistory.is-visited($routeParams.id) or IS_PRERENDERING
    @open-info-modal!

  # Add or update visit record
  #
  VisitHistory.add $routeParams.id

.controller \ModalCtrl, <[
       EtherCalcData  $routeParams
]> ++ (EtherCalcData, $routeParams) !->

  @ethercalc-id = $routeParams.id
  EtherCalcData.then (data) !~>
    @EDIT_URL = data.EDIT_URL
    @INFO_URL = data.INFO_URL

.controller \HeadCtrl, <[
       EtherCalcData  $routeParams
]> ++ (EtherCalcData, $routeParams) !->
  @title = 'Hacktabl 協作比較表格'
  @ethercalc-id = ''
  @meta = do
    'og:type': 'website'
    'og:image': "http://hacktabl.org/#{require('../images/default-og-image.png')}"
    'og:description': '用 Google doc 就能協作編輯的比較表。自己的比較表自己填！'
    'og:title': @title
    'og:site_name': 'Hacktabl 協作比較表格'


  EtherCalcData.then (data) !~>
    @title = data.TITLE

    #: Set all data to be meta tags in header!
    angular.extend @meta, {'og:title': @title}, data

    #: Set this only after we are sure the ethercalc id is correct
    @ethercalc-id = $routeParams.id

.controller \TableRowCtrl, <[
       $scope
]> ++ ($scope)!->

  #: When perspective size is small enough, expand all by default
  #:
  @is-expanded = $scope.App.data.perspectives.length <= 1

  @toggle-expand = !~>
    @is-expanded = !@is-expanded

.controller \ColumnModalCtrl, <[
       Column  TableData $scope
]> ++ (Column, data,     $scope) !->
  @model = {[columnId, true] for columnId in Column.get()}

  data.then (d) !~>
    @data = d

  @handleConfirmButton = !~>
    Column.set [''+columnId for columnId, isSelected of @model when isSelected]
    $scope.$close!

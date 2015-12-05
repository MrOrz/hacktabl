require 'angular-sanitize/angular-sanitize.js'
require 'angular-ga/ga.js'
require '../../vendor/javascripts/ui-bootstrap-selected'
require './app-router'
const ethercalc-data-cache = require '../../config/ethercalc-data'

angular.module \app.service, <[ngSanitize ga ui.bootstrap.selected app.router app.constant]>
#
# Debounced window scroll event listener, built to avoid layout threshing
#
.factory \WindowScroller, <[
       $window  $timeout  $rootScope
]> ++ ($window, $timeout, $rootScope) ->
  win = angular.element($window)

  # scroll values
  values = {}
  getValues = ->
    values.offsetHeight = $window.document.body.offsetHeight
    values.clientHeight = $window.document.body.clientHeight
    values.scrollTop    = $window.document.body.scrollTop

    return values

  # registered callbacks
  callbacks = []

  # Debounced scroll event handling using requestAnimationFrame
  # http://www.html5rocks.com/en/tutorials/speed/animations/
  #
  isRequesting = false

  launchCallbacks = ->
    # console.log 'window scroller callbacks launching'
    $rootScope.$apply ->
      for callback in callbacks
        callback values
    isRequesting = false

  win.on 'scroll', ->
    getValues!

    # Skip if the animation frame is already requested.
    return if isRequesting

    # Request the animation frame.
    requestAnimationFrame launchCallbacks
    isRequesting = true


  # Return the service object singleton
  subscribe: (callback) ->

    callbacks.push callback
    $timeout -> callback getValues!

    # Returns unsubscribe function
    return ->
      callbacks.splice callbacks.indexOf(callback), 1

#
# The app-wide scroll-spy state machine
#
.service \Spy, class Spy
  ->
    @spies = []
    @current = null

  add: (spy-id) -> @spies = @spies ++ spy-id
  remove: (spy-id) -> @spies.splice @spies.indexOf(spy-id), 1

#
# The app-wide multi-purpose state machine
#
.service \State, class State

  # Defined state name and their possible values.
  # The first enumerated value of each state is the default state value.
  #
  @enum =
    titlebar: <[title toolbox]> # Show title or toolbox in header
    labels: [true, false]       # Whether the labels in content to be shown
    comment: [null]             # The ID of currently shown comment

  ->
    # Set the states to the instance
    #
    for own let name, values of @@enum
      @[name] = values[0]

  # Cycle through the state value, given a state name
  #
  $cycle: (name) ->
    current-index = @@enum[name].indexOf @[name]
    new-index = (current-index + 1) % @@enum[name].length
    console.log(current-index, new-index)
    @[name] = @@enum[name][new-index]

  # Reset the state value to default
  #
  $reset: (name) ->
    @[name] = @@enum[name][0]

  # Return true if the state value is default
  $is-default: (name) ->
    @[name] is @@enum[name][0]

#
# Decodes HTML entities
#
# http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
#
# Should only take 5ms to do the entire google doc.
#
.factory \HtmlDecoder, ->
  textarea = angular.element('<textarea></textarea>')[0]

  # Decoder function
  (encoded) ->
    textarea.innerHTML = encoded
    return textarea.value

#
# Attach comment to highlighted content.
#
.factory \HighlightParser, <[
       $interpolate  CommentParser  EtherCalcData  StyleData  $sanitize
]> ++ ($interpolate, CommentParser, EtherCalcData, StyleData, $sanitize) ->

  const COMMENT = /<span[^>]*>([^<]+)<\/span>((?:<sup>.+?<\/sup>)+)/gim
  const EXTRACT_ID = /#cmnt(\d+)/g
  const GARBAGE_LEN = '#cmnt'.length
  const SPAN_START = /<span[^>]*>/gim
  const SPAN_END   = /<\/span>/gim
  const SPAN_PLACEHOLDER_STR = 'xx-span-xx'
  const SPAN_PLACEHOLDER = new RegExp SPAN_PLACEHOLDER_STR, 'gm'
  const CLASS      = /\s+class="([^"]+)"/gim

  const GENERATE_COMMENT = (^^options) ->
    options.placement = '{{placement}}' # By-pass for the comment directive
    options.tag-name ||= 'span'
    options.classes = JSON.stringify(options.classes || {})

    return $interpolate('
      <{{tagName}} comment="{{id}}" comment-placement="{{placement}}"
       comment-append-to-body="true" ng-class=\'{{classes}}\'>{{content}}</{{tagName}}>
      ') options

  parser = (doc, comments = {}, options = {}) ->

    doc = $sanitize doc unless options.no-sanitize

    # Construct the comments
    result = doc.replace COMMENT, (m, content, sups) ->
      # sups should look like:
      # <sup>....</sup><sup>....</sup><sup>....</sup>...
      #
      # We now track the ids from those <sup>s
      #
      ids = sups.match EXTRACT_ID .map (.slice(GARBAGE_LEN))
      classes = {}
      for id in ids
        cls = switch comments[id]?type
        case CommentParser.types.REF_MISSING, CommentParser.types.REF_CONTROVERSIAL, CommentParser.types.QUESTIONABLE => \is-controversial
        case CommentParser.types.NOTE => \is-info

        classes[cls] = true if cls

      return GENERATE_COMMENT do
        id: ids * \,
        content: content
        tag-name: SPAN_PLACEHOLDER_STR
        classes: classes

    # Dealing with span if not going to have highlight
    #
    # console.log \HIGHLIGHT, options.has-highlight
    unless options.has-highlight
      result .= replace SPAN_START, ''
        .replace SPAN_END, ''
        .replace CLASS, ''
    else
      result .= replace CLASS, (matched, class-str) ->
        merged-styles = {}
        for style in class-str.split ' '
          for own prop, val of StyleData[style]
            merged-styles[prop] ||= val
            # console.log "CLASSES", class-str.split ' '
            # console.log "STYLEDATA", StyleData
        return " ng-class='#{JSON.stringify merged-styles}'"

    # Lastly, do trimming and change the comment span back
    #
    result .= trim!
      .replace SPAN_PLACEHOLDER, 'span'

    return result


  parser.GENERATE_COMMENT = GENERATE_COMMENT

  return parser

#
# Split a <li> content into labels, content and its reference
# &#20986;&#34389; = 出處
# &#160; = &nbsp; = space
#
.factory \ItemSplitter, <[
         HtmlDecoder
  ]> ++ (HtmlDecoder) ->
  const REF_SPLITTER  = /\[\s*&#20986;&#34389;\s*(?:&#160;)*/gm
  const LABEL_MATCHER = /^\s*\[([^\]]+)\]\s*/
  const REF_END = /]/gim
  const EMPTY_SPAN = /<span\s*[^>]*><\/span>/gim
  const TAGS = /<\/?[^>]*>/gim

  # Returned function
  (doc) ->
    doc = doc.trim!

    # Removing reference from content
    #
    ref-idx = doc.search REF_SPLITTER
    # If REF_splitter is not found, set to the end of the string
    ref-idx = doc.length if ref-idx is -1

    content = doc.slice(0, ref-idx)

    # Strip all html tags before processing labels so that html tags don't get
    # in the way.
    #
    stripped-content = content.replace(TAGS, '')

    labels = []
    while matched = stripped-content.match LABEL_MATCHER
      labels.push HtmlDecoder(matched[1])
      stripped-content = stripped-content.slice matched[0].length

    # Remove all labels from content, but keep contents (like <span>) before
    # 1st "[" and after the last "]"
    #
    if labels.length > 0
      first-bracket-position = content.index-of '['
      last-bracket-position = 0
      for i til labels.length
        last-bracket-position = content.index-of ']', last-bracket-position + 1

      content = content.slice(0, first-bracket-position).trim! + content.slice(last-bracket-position+1).trim!


    # Returned object
    labels: labels
    content: content
    ref: doc.slice(ref-idx)
            .replace(REF_SPLITTER, '').replace(REF_END, '')

            # Removal of the above two may cause empty spans.
            .replace(EMPTY_SPAN, '')

            .trim!

#
# Find table and extract data into the following format:
# {
#   positionTitle: [],
#   perspectives: [ // 面向
#     {
#       title: "a * b",
#       positions: [[{ref, content}, ...], [...]] // 立場發言
#     }
#     ...
#   ]
#
#
.factory \TableParser, <[
       ItemSplitter  HighlightParser  CommentParser  HtmlDecoder
]> ++ (ItemSplitter, HighlightParser, CommentParser, HtmlDecoder)->

  const TR_EXTRACTOR = /<tr[^>]*>(.+?)<\/tr>/gim
  const TD_EXTRACTOR = /<td[^>]*>(.*?)<\/td>/gim
  const TAGS = /<\/?[^>]*>/gim
  const SUMMARY_EXTRACTOR = /^<td[^>]*>(.*?)<ul[^>]*>/im # The first non-<li> paragraph is regarded as summary
  const LI_EXTRACTOR = /<li[^>]*>(.+?)<\/li>/gim
  const LI_START = /<li[^>]*>/
  const LI_END = /<\/li>/
  const BLOCK_TAG_START = /<(?:(?:td)|(?:p)|(?:div)|(?:h\d))[^>]*>/g
  const BLOCK_TAG_END = /<\/(?:(?:td)|(?:p)|(?:div)|(?:h\d))>/g
  const SUP_EXTRACTOR = /<sup[^>]*>.+?<\/sup>/g

  # Helper function that cleans up tag matches
  # to include only the textual content inside the tag
  #
  function cleanup-tags matched-string
    matched-string.replace TAGS, '' .trim!

  function cleanup-block-tags matched-string
    matched-string.replace BLOCK_TAG_START, '' .replace BLOCK_TAG_END, '' .trim!

  function cleanup-li matched-string
    matched-string.replace LI_START, '' .replace LI_END, '' .trim!

  # Returned function
  (doc, parser-options = {}) ->

    # 0. Get the comments
    #
    comments = CommentParser doc

    # 1. Scan through each <tr>
    #
    trs = doc.replace(/\n/gm, '').match(TR_EXTRACTOR) || ['']

    # Process the first row,
    # ignore the first column because it's empty
    tds = (trs[0].match(TD_EXTRACTOR)?.slice 1) || []

    # Each td is a title of position.
    position-title = for td in tds
      HighlightParser cleanup-block-tags(HtmlDecoder(td)), comments, parser-options

    # Remove first row
    trs.shift!

    # 2 For each <tr>, scan through each <td>
    #
    perspectives = for tr in trs
      tds = tr.match TD_EXTRACTOR

      # First column should be the perspective title
      decoded-title = HtmlDecoder(tds[0])
      title = cleanup-tags decoded-title.replace(SUP_EXTRACTOR, '')
      title-html = HighlightParser cleanup-block-tags(decoded-title), comments, parser-options

      # Remove first column
      tds.shift!

      # 3 For each td, Scan trough each <li>
      #
      positions = for td in tds

        lis = (td.match LI_EXTRACTOR) || []
        summary-matches = td.match SUMMARY_EXTRACTOR
        summary = HighlightParser cleanup-block-tags(if summary-matches then summary-matches.1 else '')

        debate-arguments = for li in lis
          argument = ItemSplitter cleanup-li(li)
          argument.content = HighlightParser argument.content, comments, parser-options
          argument.ref = HighlightParser argument.ref, comments, parser-options

          # Return the argument for the iteration
          argument

        # use popular labels for summary when parser-option said so.
        if parser-options.label-count-to-use
          label-counts = {}

          # Counting each label in this td
          for argument in debate-arguments
            for label in argument.labels
              label-counts[label] = if label-counts[label] then label-counts[label]+1 else 1

          # Generate summary using the most popular labels
          summary-using-label = [{label: label, count: count} for own let label, count of label-counts].sort (a, b) ->
            b.count - a.count
          .map (item) ->
            item.label
          .slice(0, parser-options.label-count-to-use)
          .join '、'

          summary = if summary-using-label then summary-using-label else summary

        # Return all arguments & its summary of a position for the iteration
        {summary, debate-arguments}

      # Return the perspective object for this iteration of the for-loop
      {title, title-html, positions}

    # Returned object
    {position-title, perspectives, comments}


.factory \TableData, <[
       TableParser  $http  EtherCalcData  StyleData  ERRORS
]> ++ (TableParser, $http, EtherCalcData, StyleData, ERRORS) ->

  parser-options = {}
  # Return a promise that resolves to parsed table data
  EtherCalcData.then (data)->

    # Populate the parser-options from ethercalc
    parser-options :=
      has-highlight: data.HIGHLIGHT
      label-count-to-use: +data.LABEL_SUMMARY


    # return the promise of table data
    $http.get data.DATA_URL .catch (reason) ->

      # If 'share option' of google doc is closed,
      # it DATA_URL will be redirected to Google Login page,
      # which is not alloed for cross-origin requests.
      #
      # It will trigger CORS error and returns with status 0.
      #
      if reason.status === 0
        return Promise.reject(ERRORS.NOT_SHARED)

  .then (resp) ->
    StyleData.$parse resp.data
    TableParser resp.data, parser-options


.factory \EtherCalcData, <[
       $rootScope  $http  $q  ERRORS  STYLE
]> ++ ($rootScope, $http, $q, ERRORS, STYLE) ->

  return new Promise (resolve, reject) !~>

    deregister = $rootScope.$on \$routeChangeSuccess, (e, route) !~>
      id = route.params.id

      if id?length is 0 # Should not be here because we have router...
        reject ERRORS.NO_ID
        return

      deregister!

      if ethercalc-data-cache[id]
        # Check cache first
        resolve ethercalc-data-cache[id]
        return

      $http.get "https://ethercalc.org/#{id}.csv" .then (csv) !->
        console.log 'CSV', csv
        data = {}

        for row in csv.data.split "\n"
          columns = row.split \,
          data[columns.0] = columns.1.match(/^"?(.*?)"?$/).1 if columns.length >= 2

        resolve data

      .catch (e) !->
        if e.status is 404
          reject ERRORS.NO_ETHERCALC
        else
          reject e

  .then (data) ->
    # populate EDIT_URL and DATA_URL when DOC_ID is given
    if data.DOC_ID
      data.EDIT_URL ||= "https://docs.google.com/document/d/#{data.DOC_ID}/edit"
      data.DATA_URL ||= "https://docs.google.com/feeds/download/documents/export/Export?id=#{data.DOC_ID}&exportFormat=html"

    else if data.DATA_URL
      # populate DOC_ID if only DATA_URL is given
      data.DOC_ID = data.DATA_URL.match /id=([^&]+)/ .1

    else
      return Promise.reject(ERRORS.NO_DOC_INFO)

    if data.LINE_LIMIT
      document.body.classList.add('has-line-limit')
      style-elem = document.create-element \style
      style-elem.innerHTML = "
        .l-row li:not(:hover) {max-height: #{+data.LINE_LIMIT * STYLE.LINE_HEIGHT}px;}
        .l-row li:not(:hover):before {top: #{(+data.LINE_LIMIT - 1) * STYLE.LINE_HEIGHT}px;}
      "
      document.body.append-child style-elem

    if data.LINE_LIMIT_DESKTOP
      document.body.classList.add('has-line-limit')
      style-elem = document.create-element \style
      style-elem.innerHTML = "
        @media screen and (min-width: 768px) {
          .l-row li:not(:hover) {max-height: #{+data.LINE_LIMIT_DESKTOP * STYLE.LINE_HEIGHT}px;}
          .l-row li:not(:hover):before {top: #{(+data.LINE_LIMIT_DESKTOP - 1) * STYLE.LINE_HEIGHT}px;}
        }
      "
      document.body.append-child style-elem

    return data

.config <[
       $sceDelegateProvider
]> ++ ($sceDelegateProvider) !->
  $sceDelegateProvider.resourceUrlWhitelist <[self https://docs.google.com/** https://hackpad.com/** https://*.hackpad.com/**]>

#
# Find comments and return in the following format:
#
# {
#   commentId: {
#     content: HTMLS tring
#     type: one of REF_MISSING, REF_CONTROVERSIAL, NOTE
#   }, ...
# }
#
.factory \CommentParser, <[
       linky
]> ++ (linky) ->

  const REF_MISSING = \REF_MISSING
  const REF_CONTROVERSIAL = \REF_CONTROVERSIAL
  const QUESTIONABLE = \QUESTIONABLE
  const NOTE = \NOTE
  const SECOND = \SECOND # 附議
  const OTHER = \OTHER

  const COMMENT_DIV_EXTRACTOR = /<div[^>]*><p[^>]*><a[^>]+name="cmnt(\d+)">[^>]+<\/a>(.+?)<\/div>/gim
  const TYPE_EXTRACTOR = /^\[([^\]]+)\]\s*/
  const SECOND_MATCHER = /^\+1/
  const SPAN_START = /<span class="[^"]+">/gim
  const SPAN_END   = /<\/span>/gim
  const CLASS      = /\s+class="[^"]+"/gim

  # The exposed parser function
  parser = (doc) ->
    comments = {}
    while matched = COMMENT_DIV_EXTRACTOR.exec doc
      id = matched.1
      raw-content = matched.2.replace(SPAN_START, '').replace(SPAN_END, '')
                           .replace(CLASS, '').trim!

      # Process [] tags
      raw-type = raw-content.match(TYPE_EXTRACTOR)?1

      type = switch raw-type
      | '&#35036;&#20805;&#35498;&#26126;' => NOTE
      | '&#38656;&#35201;&#20986;&#34389;' => REF_MISSING
      | '&#20986;&#34389;&#29229;&#35696;' => REF_CONTROVERSIAL
      | '&#36074;&#30097;' => QUESTIONABLE
      | _  => OTHER

      # Remove []
      content = raw-content.replace TYPE_EXTRACTOR, '' .trim!

      # If the user is seconding other, change its type
      type = SECOND if content.match SECOND_MATCHER

      # Prepend the missing starting <p> tag and apply linky.
      content = linky "<p>" + content

      comments[id] = {type, content}

    # Returned object
    comments

  # Expose the type constants
  parser.types = {REF_MISSING, REF_CONTROVERSIAL, QUESTIONABLE, NOTE, SECOND, OTHER}

  return parser

.factory \StyleData, <[
]> ++ ->
  const STYLE_TAG_EXTRACTOR = /<style[^>]*>(.*)<\/style>/im
  const STYLE_RULE_EXTRACTOR = /\.(c\d+)\{([^}]+)\}/gim

  const UNDERLINE = 'text-decoration:underline'
  const ITALIC = 'font-style:italic'
  const BOLD = 'font-weight:bold'

  # Returned style data
  #
  style-data =
    $parse: (doc) ->
      style-content = doc.match STYLE_TAG_EXTRACTOR .1
      styles = {}

      # The parser function processes {+underline, +italic, +bold}
      while matched = STYLE_RULE_EXTRACTOR.exec style-content
        style-str = matched.2
        interested-styles =
          underline: style-str.index-of(UNDERLINE) != -1
          italic: style-str.index-of(ITALIC) != -1
          bold: style-str.index-of(BOLD) != -1

        styles[matched.1] = interested-styles if interested-styles.underline || interested-styles.italic || interested-styles.bold

      style-data <<< styles
      return styles

  return style-data

#
# "linkyUnsanitized" implementation
# http://stackoverflow.com/questions/14692640/angularjs-directive-to-replace-text/24291287#24291287
#
.factory \linky, ->
  LINKY_URL_REGEXP =
    /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)[^\s<>]*[^\s.;,(){}<>]/
  MAILTO_REGEXP = /^mailto:/

  return (text, target) ->
    return text if !text
    raw = text
    html = []

    while m = raw.match(LINKY_URL_REGEXP)
      # We can not end in these as they are sometimes found at the end of the sentence
      url = m.0
      # if we did not match ftp/http/mailto then assume mailto
      url = "mailto:#{url}" if m.2 is m.3
      i = m.index
      addText raw.substr(0, i)
      addLink url, m[0].replace(MAILTO_REGEXP, '')
      raw = raw.substring(i + m[0].length)

    addText(raw)
    return html.join ''

    function addText text
      return if !text
      html.push text

    function addLink url, text
      html.push '<a '
      if angular.isDefined target
        html.push 'target="'
        html.push target
        html.push '" '
      html.push 'href="'
      html.push url
      html.push '">'
      addText text
      html.push '</a>'

.factory \VisitHistory, <[
       EtherCalcData
]> ++ (EtherCalcData)->
  history-data = {}

  reload-data = ->
    if local-storage.visited
      history-data := JSON.parse(local-storage.visited)

  reload-data!

  return do
    is-visited: (key) ->
      return !!history-data[key]

    get: ->
      data-arr = for own let key, data of history-data
        data.key = key
        data

      return data-arr.sort (a, b) -> a.time - b.time


    add: (key) ->
      data <- EtherCalcData.then

      history-data[key] = do
        time: Date.now!
        doc-id: data.DOC_ID
        title: data.TITLE

      local-storage.visited = JSON.stringify history-data
      reload-data!

.factory \Column, <[
       EtherCalcData  $routeParams
]> ++ (EtherCalcData, $routeParams) ->
  columns = []          # Column IDs th show
  id = $routeParams.idx # hacktabl ID, like "president2016"

  fetch-from-localstorage = ->
    column-data = {}
    if local-storage.column-data
      column-data = JSON.parse(local-storage.column-data)
    return column-data

  column-data = fetch-from-localstorage!
  if column-data[id]
    columns := column-data[id]

  return do
    get: ->
      return columns

    includes: (id) ->
      return columns.index-of(id) != -1

    size: ->
      return columns.length

    set: (new-columns) ->
      columns := new-columns

      column-data = fetch-from-localstorage!
      column-data[id] = columns

      local-storage.column-data = JSON.stringify(column-data)

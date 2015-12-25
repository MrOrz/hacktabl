// This directly mutates table data returned by server.
//

// Underline: [GREEN | RED | YELLOW | DASHED | DOTTED]_UNDERLINE
// Font color: GREEN | RED | YELLOW | GRAY
// [?] suffix: QUESTION_INDICATOR
// [!] suffix: EXCLAMATION_INDICATOR
// [⋯] suffix: MORE_INDICATOR
//
const DEFAULT_COMMENT_TYPE_MAP = {
  '出處爭議': ['GRAY', 'RED_UNDERLINE', 'DOTTED_UNDERLINE', 'EXCLAMATION_INDICATOR'],
  '質疑': ['RED_UNDERLINE'],
  '補充說明': ['GREEN_UNDERLINE'],
  '需要出處': ['GRAY', 'QUESTION_INDICATOR']
}

export default function processTableData(data) {
  if(data.config.LINE_LIMIT){
    data.config.LINE_LIMIT = +data.config.LINE_LIMIT
  }

  if(data.config.LINE_LIMIT_DESKTOP){
    data.config.LINE_LIMIT_DESKTOP = +data.config.LINE_LIMIT_DESKTOP
  }

  let labelClassnameMap = {}
  Object.keys(data.config, key => {
    let m = key.trim().match(/^COMMENT\[([^]]+)\]$/)
    if(m){
      labelClassnameMap[m[1]] = data.config[key].split(' ')
    }
  })

  data.config.COMMENT_TYPE_MAP = Object.assign({}, DEFAULT_COMMENT_TYPE_MAP, labelClassnameMap)

  return data
}
let THRESHHOLD = 0;
let FULL_EXACTMATCH_MODIFIER  = 1.0;
let FULL_STARTSWITH_MODIFIER  = 0.9;
let FULL_CONTAINS_MODIFIER    = 0.3;
let FULL_PARTIAL_MODIFIER     = 0.3;
let PRECISION = 2;
let re = /[\s\b]+/g;

module.exports = (term, arr, keys) => {
  let items = [];
  if (!term) {
    return arr.map(x => x)
  } else {
    let lowerTerm = term.toLowerCase();
    let terms = lowerTerm.split(re).filter(Boolean);
    arr
      .map(value => { return { $rel: 0, value } })
      .forEach((item)=>{
        const scores = keys.reduce((acc, property, i) => {
          const { key, weight } = property
          let lowerValue = ((item.value || {})[key] || '').toLowerCase();
          let tokens = lowerValue.toLowerCase().split(re).filter(Boolean);
          let exactMatchScore   = FULL_EXACTMATCH_MODIFIER * (lowerValue === lowerTerm ? 1 : 0);
          let startsWithScore   = FULL_STARTSWITH_MODIFIER * (lowerValue !== lowerTerm && lowerValue.startsWith(lowerTerm) ? 1 : 0) * (lowerTerm.length / lowerValue.length);
          let containsScore     = FULL_CONTAINS_MODIFIER * (lowerTerm.length / lowerValue.length) * (lowerValue.indexOf(lowerTerm) > 0 ? 1 : 0);
          let partialMatchScore = FULL_PARTIAL_MODIFIER * terms.map((term, i)=>{
            let exactMatchCount = tokens.filter(token => term === token).length ? 1 : 0;
            let tokenStartsWithLength = tokens.reduce((acc, token)=>{
              if(!token.startsWith(term)) return acc;
              return Math.max(token.length, acc);
            }, 0);
            let startsWithCount = tokenStartsWithLength ? (term.length / tokenStartsWithLength) : 0;
            let tokenContainsLength = tokens.reduce((acc, token)=>{
              if(token.indexOf(term) < 1) return acc;
              return Math.max(token.length, acc);
            }, 0);
            let containsCount = tokenContainsLength ? (term.length / tokenContainsLength) : 0;
            return Math.max(exactMatchCount, startsWithCount, containsCount);
          }).reduce((x, y) => x + y) / (tokens.length + terms.length);
          return {
            exactMatchScore: (exactMatchScore * weight) + acc.exactMatchScore,
            startsWithScore: (startsWithScore * weight) + acc.startsWithScore,
            containsScore: (containsScore * weight) + acc.containsScore,
            partialMatchScore: (partialMatchScore * weight) + acc.partialMatchScore
          }
        }, {
          exactMatchScore: 0,
          startsWithScore: 0,
          containsScore: 0,
          partialMatchScore: 0,
        })

        scores.exactMatchCount = scores.exactMatchCount / keys.length
        scores.startsWithScore = scores.startsWithScore / keys.length
        scores.containsScore = scores.containsScore / keys.length
        scores.partialMatchScore = scores.partialMatchScore / keys.length

        item.$rel = {
          exactMatchScore: scores.exactMatchScore,
          startsWithScore: scores.startsWithScore,
          containsScore: scores.containsScore,
          partialMatchScore: scores.partialMatchScore,
          toString(){
            return `r${this.valueOf().toFixed(PRECISION)} - e${this.exactMatchScore.toFixed(PRECISION)} - s${this.startsWithScore.toFixed(PRECISION)} - c${this.containsScore.toFixed(PRECISION)} - p${this.partialMatchScore.toFixed(PRECISION)}`;
          },
          valueOf(){
            return Math.max(
              this.exactMatchScore,
              this.startsWithScore,
              ((this.containsScore + this.partialMatchScore) / 2)
            );
          }
        };
        if(item.$rel > THRESHHOLD) items.push(item);
      });
  }
  return items.sort((a, b)=>{
    if(a.$rel > b.$rel) return -1;
    if(a.$rel < b.$rel) return 1;
    // TODO
    // if(a[key] < b[key]) return -1;
    // if(a[key] > b[key]) return 1;
    return 0;
  }).map(x => x.value);
}
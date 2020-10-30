// @ts-nocheck
export const $$observable = /* #__PURE__ */ (() =>
    (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

export function sleep(callback) {
    setTimeout(() => {
        callback && callback();
    }, 300);
}

const batchCount = 10
export const getGoods = ({ page }) => {
    const results = []
  
    for (let i = 0; i < batchCount; i++) {
      const index = page * batchCount + i
      results.push({
        id: index,
        title: `goods-${index}`,
        count: Math.floor(Math.random() * 10) + 1,
        description: `category-${index}`,
      })
    }
  
    return results
  }


const batchCount = 10

export const goodsDataGenerator = ({ page }) => {
  const results = []

  for (let i = 0; i < batchCount; i++) {
    const index = page * batchCount + i
    results.push({
      id: index,
      title: `goods-${index}`,
      description: `category-${index}`,
    })
  }

  return results
}

export const getGoods = ({ page }) => new Promise(resolve => {
  setTimeout(() => {
    resolve(goodsDataGenerator({ page }))
  }, 300)
})

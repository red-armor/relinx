// @ts-nocheck
export function getGoodsViewSpan(renderDom) {
    const domStr = renderDom.toJSON()
    const spanDom = domStr.children[0].children[0].children[0].children[0]
    return spanDom
}

export function getGoodsItems(renderDom) {
    const domStr = renderDom.toJSON()
    const goodViewChildren = domStr.children[0].children[0].children[0].children
    goodViewChildren.shift()
    return goodViewChildren
}

export function getGoodsItemsFiveTitle(goodItems) {
    const children = goodItems[4].children
    return children[0].children[0]
}


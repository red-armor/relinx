// @ts-nocheck
export function getStatusValue(state) {
    return state.init.status
}

export function getListLengthValue(state) {
    return state.goods.listLength
}

export function getGoodsItemsFiveValue(state) {
    return state.goods.listData[4].title
}
import type { CategoryDef } from '../types'

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'transport',
    name: '交通',
    color: '#7EC8E3',
    subs: ['机票', '高铁/动车', '打车', '巴士', '轮船', '租车自驾'],
  },
  {
    id: 'food',
    name: '餐饮',
    color: '#FFB5A7',
    subs: ['早餐', '午餐', '晚餐', '夜宵', '小吃', '饮料'],
  },
  {
    id: 'stay',
    name: '住宿',
    color: '#B8A9E8',
    subs: ['酒店', '民宿', '青旅'],
  },
  {
    id: 'ticket',
    name: '门票',
    color: '#FFE066',
    subs: ['景区大门票', '观光车票'],
  },
  {
    id: 'shop',
    name: '购物',
    color: '#98D8AA',
    subs: ['纪念品', '免税店', '当地特产'],
  },
  {
    id: 'comm',
    name: '通讯',
    color: '#C4B5FD',
    subs: ['电话卡', '随身 Wi-Fi'],
  },
  {
    id: 'activity',
    name: '活动',
    color: '#FF9ECD',
    subs: ['潜水', '滑翔伞', '按摩', '一日游'],
    custom: true,
  },
]

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id)
}

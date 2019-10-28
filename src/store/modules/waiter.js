// import request from '@/utils/request'
import { get, post, post_array } from '@/http/axios'
export default {
  namespaced: true,
  state: {
    visible: false, // 控制对话框的显示与关闭
    waiters: [], // 存放所有的顾客信息
    params: {
      // 存放分页查询所需的参数
      page: 0, // 第几页
      pageSize: 7,
      realname: '',
      telephone: ''
    },
    waiter:{}//单条顾客信息
  },
  getters: {
    conuntWaiter(state) {
      // 统计顾客的人数
      return state.waiters.length
    },
    // 需要为获取器传递参数的写法
    waiterStatusFilter(state) {
      // 对顾客的状态进行过滤
      return function(status) {
        if (status) {
          // 如果传递的状态存在则返回过滤
          return state.waiters.filter(item => item.status === status)
        } else {
          // 不存在返回全部
          return state.waiters
        }
      }
    }
  },
  mutations: {
    // 突变函数，唯一修改state的方法
    // 所有突变函数接收的第一个参数都是state
    // 显示模态框
    showModal(state) {
      state.visible = true
    },
    // 关闭模态框
    closeModal(state) {
      state.visible = false
    },
    // 刷新顾客信息
    refreshWaiter(state, waiters) {
      // 需要接收一个参数customers，state是系统给的
      state.waiters = waiters
    },
    // 根据名字查询
    searchByName(state, name) {
      state.params.realname = name
      state.params.telephone = ''
    },
    // 根据号码查询
    searchByTel(state, gender) {
      state.params.realname = ''
      state.params.telephone = telephone
    },
    // 设置单条顾客信息
    SetWaiter(state,waiter) {
      state.waiter = waiter;
    }
  },
  actions: {
    // 做异步交互
    // 查询所有顾客信息
    // async findAllCustomers({commit,dispatch,getters,state}){
    async findAllWaiter(context) {
      // context是系统分发给actions的对象，里面包含的commit可以让action去触发突变，让突变去修改state
      const response = await get('/waiter/findAll')
      // 2.将顾客信息设置到state.customers中
      // 使用commit去触发突变，先指定突变名称，再传递一个参数
      context.commit('refreshWaiter', response.data)
    },
    // 根据id删除顾客信息
    async deleteWaiterById({ dispatch }, id) {
      // 1.删除顾客信息
      const response = await get('/waiter/deleteById', {id})
      // 2.刷新(再用dispatch去触发获取一遍数据)
      dispatch('loadWaiterData')
      // 3.提示成功
      return response
    },
    // 批量删除顾客信息
    async batchDeleteWaiter({ dispatch }, ids) {
        alert(ids);
      const response = await post_array('/waiter/batchDelete', ids)
      dispatch('loadWaiterData')
      return response
    },
    // 保存修改顾客信息
    async saveOrUpdateWaiter({ dispatch, commit }, waiter) { // 结构出dispatch方法
      // 1.提交请求
      const response = await post('/waiter/saveOrUpdate', waiter)
      // 2. 关闭模态框
      commit('closeModal')
      // 3.刷新页面
      dispatch('loadWaiterData')
      // 4.提示成功
      return response
    },
    //   fun:分页初始化顾客信息
    async loadWaiterData({ state, commit }) {
      // 每次模糊查询先将page设置为0，不然有一些显示不了
      if(state.params.realname || state.params.telephone){
        state.params.page = 0;
      }
      // 1.  传递分页查询所需的参数
      // console.log("params======>",state.params)
      const response = await post('/waiter/query', state.params)
      commit('refreshWaiter', response.data)
      // 2.将分页查询中按照名字号码查询的字段清空，防止下一次的查询
      state.params.realname = ''
      state.params.telephone = ''
    }
  }
}

// import request from '@/utils/request'
import { get, post, post_array } from '@/http/axios'
export default {
  namespaced: true,
  state: {
    visible: false, // 控制对话框的显示与关闭
    customers: [], // 存放当前页所有的顾客信息
    params: {
      // 存放分页查询所需的参数
      page: 0, // 第几页
      pageSize: 7,
      realname: '',
      telephone: ''
    },
    customer:{},//单条顾客信息
    loading:false,//控制加载时的旋转圈
  },
  getters: {
    conuntCustomers(state) {
      // 统计顾客的人数
      return state.customers.length
    },
    // 需要为获取器传递参数的写法
    customerStatusFilter(state) {
      // 对顾客的状态进行过滤
      return function(status) {
        if (status) {
          // 如果传递的状态存在则返回过滤
          return state.customers.filter(item => item.status === status)
        } else {
          // 不存在返回全部
          return state.customers
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
    refreshCustomer(state, customers) {
      // 需要接收一个参数customers，state是系统给的
      state.customers = customers
    },
    // 根据名字查询
    searchByName(state, name) {
      state.params.realname = name
      state.params.telephone = ''
    },
    // 根据号码查询
    searchByTel(state, tel) {
      state.params.realname = ''
      state.params.telephone = tel
    },
    // 设置单条顾客信息
    SetCustomer(state,customer) {
      state.customer = customer;
    },
    // 设置加载旋转圈旋转
    SetStartLoading(state) {
      state.loading = true;
    },
    // 设置加载旋转圈不旋转
    SetEndLoading(state) {
      state.loading = false;
    }
  },
  actions: {
    // 做异步交互
    // 查询所有顾客信息
    // async findAllCustomers({commit,dispatch,getters,state}){
    async findAllCustomers(context) {
      // context是系统分发给actions的对象，里面包含的commit可以让action去触发突变，让突变去修改state
      const response = await get('/customer/findAll')
      // 2.将顾客信息设置到state.customers中
      // 使用commit去触发突变，先指定突变名称，再传递一个参数
      context.commit('refreshCustomer', response.data)
    },
    // 根据id删除顾客信息
    async deleteCustomerById({state, dispatch }, id) {
      // 先判断当前删除的是否为当前页最后一条，如果是，则查询页减一
      if((state.customers.total%state.params.pageSize)==1){
        state.params.page--;
      }
      // 1.删除顾客信息
      const response = await get('/customer/deleteById', {id})

      // 2.刷新(再用dispatch去触发获取一遍数据)
      dispatch('loadCustomerData')
      // 3.提示成功
      return response
    },
    // 批量删除顾客信息
    async batchDeleteCustomers({state, dispatch }, ids) {
      // 先判断当前删除的是否为当前页最后一条，如果是，则查询页减一
      if(((state.customers.total-ids.length)%state.params.pageSize)==0){
        state.params.page--;
      }
      const response = await post_array('/customer/batchDelete', ids)

      dispatch('loadCustomerData')
      return response
    },
    // 保存修改顾客信息
    async saveOrUpdateCustomer({ dispatch, commit }, customer) { // 结构出dispatch方法
      // 1.提交请求
      const response = await post('/customer/saveOrUpdate', customer)
      // 2. 关闭模态框
      commit('closeModal')
      // 3.刷新页面
      dispatch('loadCustomerData')
      // 4.提示成功
      return response
    },
    //   fun:分页初始化顾客信息
    async loadCustomerData({ state, commit }) {
      // 设置加载的圈圈
      commit('SetStartLoading');
      // 1.  传递分页查询所需的参数
      // console.log("params======>",state.params)
      
      const response = await post('/customer/query', state.params)
      commit('refreshCustomer', response.data)
      // 加载完毕加载圈隐藏
      commit('SetEndLoading');
      // console.log("refreshCustomer",state.customers);
      
    }
  }
}

// import request from '@/utils/request'
import { get, post, post_array } from '@/http/axios'
export default { 
  namespaced: true,
  state: {
    visible: false, // 控制对话框的显示与关闭
    products: [], // 存放所有的产品信息
    params: {
      // 存放分页查询所需的参数
      page: 0, // 第几页
      pageSize: 7,
      name: '',
      price: ''
    },
    product:{}, //单条产品信息
    loading:false,//控制加载时的旋转圈
  },
  getters: {
    conuntProducts(state) {
      // 统计产品的数量
      return state.products.length
    },
    // 需要为获取器传递参数的写法
    productStatusFilter(state) {
      // 对产品的状态进行过滤
      return function(status) {
        if (status) {
          // 如果传递的状态存在则返回过滤
          return state.products.filter(item => item.status === status)
        } else {
          // 不存在返回全部
          return state.products
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
    // 刷新产品信息
    refreshProduct(state, products) {
      // 需要接收一个参数products，state是系统给的
      state.products = products
    },
    // 根据产品名称查询
    searchByName(state, name) {
      state.params.name = name
      state.params.price = ''
    },
    // 根据价格查询
    searchByPrice(state, price) {
      state.params.name = ''
      state.params.price = price
    },
    // 设置单条产品信息
    SetCustomer(state,product) {
      state.product = product;
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
    // 查询所有产品信息
    // async findAllProducts({commit,dispatch,getters,state}){
    async findAllProducts(context) {
      // context是系统分发给actions的对象，里面包含的commit可以让action去触发突变，让突变去修改state
      const response = await get('/product/findAll')
      // 2.将产品信息设置到state.products中
      // 使用commit去触发突变，先指定突变名称，再传递一个参数
      context.commit('refreshProduct', response.data)
    },
    // 根据id删除产品信息
    async deleteProductById({state, dispatch }, id) {
      // 先判断当前删除的是否为当前页最后一条，如果是，则查询页减一
      if((state.products.total%state.params.pageSize)==1){
        state.params.page--;
      }
      // 1.删除产品信息
      const response = await get('/product/deleteById', { id })
      // 2.刷新(再用dispatch去触发获取一遍数据)
      dispatch('loadProductData')
      // 3.提示成功
      return response
    },
    // 批量删除产品信息
    async batchDeleteProducts({state, dispatch }, ids) {
       // 先判断当前删除的是否为当前页最后一条，如果是，则查询页减一
      if(((state.products.total-ids.length)%state.params.pageSize)==0){
        state.params.page--;
      }
      const response = await post_array('/product/batchDelete', ids)
      dispatch('loadProductData')
      return response
    },
    // 保存修改产品信息
    async saveOrUpdateProduct({ dispatch, commit }, product) { // 结构出dispatch方法
      // 1.提交请求
      const response = await post('/product/saveOrUpdate', product)
      // 2. 关闭模态框
      commit('closeModal')
      // 3.刷新页面
      dispatch('loadProductData')
      // 4.提示成功
      return response
    },
    //   fun:分页初始化产品信息
    async loadProductData({ state, commit }) {
      // 设置加载的圈圈
      commit('SetStartLoading');

      // 1.  传递分页查询所需的参数
      // console.log("params======>",state.params)
      const response = await post('/product/query', state.params)
      commit('refreshProduct', response.data)
      // 加载完毕加载圈隐藏
      commit('SetEndLoading');
      // 2.将分页查询中按照名字号码查询的字段清空，防止下一次的查询
      state.params.name = ''
      state.params.price = ''
    }
  }
}

<template>
  <view class="uni-container">
    <uni-forms ref="form" :value="formData" validateTrigger="bind">
      <uni-forms-item name="title" label="名称" required>
        <uni-easyinput placeholder="文章标题" v-model="formData.title" trim="both"></uni-easyinput>
      </uni-forms-item>
	  <uni-forms-item name="avatar" label="封面">
	  	<uni-file-picker v-model="formData.imageValue" :image-styles="{'width' : '200rpx'}"
	  		return-type="object" file-mediatype="image" limit="1" mode="grid"
	  		@success="(res) => iconUrlSuccess(res,'avatar')"
	  		@delete="(res) => iconUrlDelete(res,'avatar')">
	  	</uni-file-picker>
	  </uni-forms-item>
      <uni-forms-item name="content" label="内容">
        <uni-easyinput type="textarea" placeholder="文章内容" v-model="formData.content" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="article_status" label="是否发布">
      	<switch  @change="binddata('article_status', $event.detail.value)" :checked="formData.article_status" />
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">{{$t('common.button.submit')}}</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
            <button class="uni-button" style="width: 100px;">{{$t('common.button.back')}}</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '@/js_sdk/validator/opendb-news-articles.js';
  import mixin from './mixin/mixin.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'opendb-news-articles';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  export default {
	mixins: [mixin],
    data() {
      let formData = {
        "title": "",
		"imageValue": [],
		"avatar": "",
        "content": "",
        "article_status": true
      }
      return {
        formData,
        formOptions: {},
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      /**
       * 触发表单提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
		  console.log(res)
          this.submitForm(res)
        }).catch(() => {
          uni.hideLoading()
        })
      },

      submitForm(value) {
		let params = value
		params.article_status = params.article_status?1:0
        // 使用 clientDB 提交数据
        db.collection(dbCollectionName).doc(this.formDataId).update(params).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("article_status,avatar,content,excerpt,publish_date,title,type,user_id").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
			data.article_status = data.article_status === 1
            this.formData = data
			this.initFormData(data)
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>
<style>
	::v-deep .uni-forms-item__label {
		width: 90px !important;
	}
</style>

import {
	validator,
	mpPlatform
} from '@/js_sdk/validator/opendb-app-list.js';

const formatFilePickerValue = (url) => (url ? {
	"name": "",
	"extname": "",
	"url": url,
} : {})

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
	methods: {
		requestCloudFunction(functionName, params = {}) {
			return this.$request(functionName, params, {
				functionName: 'uni-upgrade-center'
			})
		},
		hasValue(value) {
			if (typeof value !== 'object') return !!value
			if (value instanceof Array) return !!value.length
			return !!(value && Object.keys(value).length)
		},
		initFormData(obj) {
			if (!obj || !Object.keys(obj).length) return;
			// TODO delete
			for (let key in obj) {
				const value = obj[key]
				switch (key) {
					case 'avatar':
						this.formData.imageValue = formatFilePickerValue(value)
						break;
					default:
						break;
				}
				this.setFormData(key, value)
			}
		},
		setFormData(key, value) {
			const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
			const lens = keys.length - 1
			let tempObj = this.formData
			keys.forEach((key, index) => {
				const obj = tempObj[key]
				if (typeof obj === 'object' && index < lens) {
					tempObj = obj
				} else {
					tempObj[key] = value
				}
			})
		},
		getFormData(key) {
			const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
			const lens = keys.length - 1
			let tempObj = this.formData
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i]
				tempObj = tempObj[key]
				if (tempObj == null) {
					return false
				}
			}
			return tempObj
		},
		iconUrlSuccess(res, key) {
			uni.showToast({
				icon: 'success',
				title: '上传成功',
				duration: 500
			})
			console.log(this.formData)
			this.setFormData(key, res.tempFilePaths[0])
		},
		async iconUrlDelete(res, key) {
			let deleteRes = await this.requestCloudFunction('deleteFile', {
				fileList: [res.tempFile.fileID || res.tempFile.url]
			})
			deleteRes.fileList ?
				deleteRes = deleteRes.fileList[0] :
				deleteRes = deleteRes[0];
			if (deleteRes.success || deleteRes.code === "SUCCESS") {
				uni.showToast({
					icon: 'success',
					title: '删除成功',
					duration: 800
				})
				if (!key) return;
				this.setFormData(key, '')
				this.$refs.form.clearValidate(key)
			}
		},
		selectFile() {
			if (this.hasPackage) {
				uni.showToast({
					icon: 'none',
					title: '只可上传一个文件，请删除已上传后重试',
					duration: 1000
				});
			}
		}
	}
}

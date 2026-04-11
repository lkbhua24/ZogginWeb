<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-box">
          <h3 class="modal-title">退出确认</h3>
          <p class="modal-text">退出后数据仍保存在本地，但需重新进入才能学习</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="handleCancel">取消</button>
            <button class="modal-btn confirm" @click="handleConfirm">确定退出</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'confirm'])

function handleCancel() {
  emit('update:visible', false)
}

function handleConfirm() {
  emit('update:visible', false)
  emit('confirm')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.75rem;
}

.modal-text {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: inherit;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #666;
}

.modal-btn.cancel:hover {
  background: #e5e5e5;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.modal-btn.confirm:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.fade-enter-active {
  transition: opacity 0.25s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

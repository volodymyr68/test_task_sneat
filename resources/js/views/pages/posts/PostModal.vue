<script setup>
import { ref, defineEmits, defineProps } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  submitting: Boolean,
})

const emit = defineEmits(['save', 'update:modelValue'])

const localPost = ref({ title: '', short_description: '' })

const savePost = () => {
  if (!localPost.value.title || !localPost.value.short_description) return
  emit('save', localPost.value)
  localPost.value = { title: '', short_description: '' } // Очистка формы
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="500px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Add New Post</VCardTitle>
      <VCardText>
        <VTextField
          v-model="localPost.title"
          label="Title"
          outlined
          dense
          class="mb-2"
        />
        <VTextarea
          v-model="localPost.short_description"
          label="Short Description"
          outlined
          dense
        />
      </VCardText>
      <VCardActions>
        <VBtn
          color="primary"
          :loading="submitting"
          @click="savePost"
        >
          Save
        </VBtn>
        <VBtn
          text
          @click="closeModal"
        >
          Cancel
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

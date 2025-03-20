<script setup>
import { ref, onMounted, watch } from 'vue'
import PostModal from "@/views/pages/posts/PostModal.vue"

const posts = ref([])
const errors = ref({})
const currentPage = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const searchQuery = ref('')
const dialog = ref(false)
const submitting = ref(false)

const fetchPosts = async (page = 1) => {
  loading.value = true
  errors.value = {}

  try {
    const res = await $api(`/posts?page=${page}&search=${searchQuery.value}`, { method: 'GET' })

    posts.value = res.data
    currentPage.value = res.current_page
    lastPage.value = res.last_page
  } catch (error) {
    errors.value = error.response?.data?.errors || { message: 'Failed to fetch posts' }
  } finally {
    loading.value = false
  }
}

const addPost = async (post) => {
  submitting.value = true
  try {
    await $api('/posts', {
      method: 'POST',
      body: post,
    })
    dialog.value = false
    fetchPosts()
  } catch (error) {
    console.error('Failed to add post', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPosts()
})

watch([currentPage, searchQuery], () => {
  fetchPosts(currentPage.value)
})
</script>

<template>
  <div>
    <VCard
      title="Post list"
      class="fixed-height"
    >
      <VCardText>
        <VTextField
          v-model="searchQuery"
          label="Search by title"
          dense
          outlined
          class="mb-4"
        />
      </VCardText>

      <VCardText class="content-container">
        <VProgressCircular
          v-if="loading"
          indeterminate
          class="loading-indicator"
        />
        <VTable v-else>
          <thead>
          <tr>
            <th>Created at</th>
            <th>Title</th>
            <th>Short description</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
          >
            <td>{{ new Date(post.created_at).toLocaleDateString() }}</td>
            <td>{{ post.title }}</td>
            <td>{{ post.short_description }}</td>
          </tr>
          </tbody>
        </VTable>
      </VCardText>

      <VCardActions>
        <VBtn color="primary" @click="dialog = true">Add Post</VBtn>
      </VCardActions>

      <VPagination
        v-model="currentPage"
        :length="lastPage"
        class="mt-4"
      />
    </VCard>

    <PostModal
      :model-value="dialog"
      :submitting="submitting"
      @save="addPost"
      @close="dialog = false"
    />
  </div>
</template>

<style scoped>
.fixed-height {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.content-container {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-indicator {
  margin: auto;
}
</style>

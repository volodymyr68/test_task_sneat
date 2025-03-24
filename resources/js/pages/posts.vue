<script setup>
import { ref, onMounted, watch } from 'vue'
import PostModal from "@/views/pages/posts/PostModal.vue"

const posts = ref([])
const errors = ref({})
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const dialog = ref(false)
const submitting = ref(false)
const serverItems = ref([])

const headers = [
  { title: "Created at", key: "created_at" },
  { title: "Title", key: "title" },
  { title: "Short description", key: "short_description" },
]

const loadItems = async ({ page, itemsPerPage }) => {
  loading.value = true
  errors.value = {}

  try {
    const res = await $api(`/posts?page=${page}&per_page=${itemsPerPage}&search=${searchQuery.value}`, { method: 'GET' })

    serverItems.value = res.data
    currentPage.value = res.current_page
    totalItems.value = res.total
  } catch (error) {
    errors.value = error.response?.data?.errors || { message: 'Failed to fetch posts' }
  } finally {
    loading.value = false
  }
}

const addPost = async post => {
  submitting.value = true
  try {
    await $api('/posts', {
      method: 'POST',
      body: post,
    })
    dialog.value = false
    loadItems({ page: currentPage.value, itemsPerPage: itemsPerPage.value })
  } catch (error) {
    console.error('Failed to add post', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadItems({ page: currentPage.value, itemsPerPage: itemsPerPage.value })
})

watch(searchQuery, () => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
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
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
          item-value="title"
          @update:options="loadItems"
          class="mt-4"
        >
          <template v-slot:item.created_at="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
          <template v-slot:item.title="{ item }">
            {{ item.title }}
          </template>
          <template v-slot:item.short_description="{ item }">
            {{ item.short_description }}
          </template>
        </v-data-table-server>
<!--        <VTable v-else>-->
<!--          <thead>-->
<!--          <tr>-->
<!--            <th>Created at</th>-->
<!--            <th>Title</th>-->
<!--            <th>Short description</th>-->
<!--          </tr>-->
<!--          </thead>-->
<!--          <tbody>-->
<!--          <tr-->
<!--            v-for="post in posts"-->
<!--            :key="post.id"-->
<!--          >-->
<!--            <td>{{ new Date(post.created_at).toLocaleDateString() }}</td>-->
<!--            <td>{{ post.title }}</td>-->
<!--            <td>{{ post.short_description }}</td>-->
<!--          </tr>-->
<!--          </tbody>-->
<!--        </VTable>-->
      </VCardText>

      <VCardActions>
        <VBtn color="primary" @click="dialog = true">Add Post</VBtn>
      </VCardActions>
<!--      <VPagination-->
<!--        v-model="currentPage"-->
<!--        :length="lastPage"-->
<!--        class="mt-4"-->
<!--      />-->
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

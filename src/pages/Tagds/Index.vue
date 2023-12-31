<template>
  <q-table class="q-pa-lg" :loading="isLoading" :rows="list" :columns="columns" row-key="name" :pagination="{
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 50,
  }">
    <template v-slot:top-right>
      <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr @click="onRowClicked(props.row)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-img v-if="col.name == 'thumbnail'" :src="col.value" spinner-color="white"
            style="height: 2rem; max-width: 2rem" fit="cover" />
          <span v-else>
            {{ col.value }}
          </span>
        </q-td>
        <!-- <q-td key="thumbnail" :props="props">
          {{ props.row.name }}
        </q-td> -->
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { date } from 'quasar';
import { useTagdsStore } from 'stores/tagds';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useTagdsStore();

const filter = ref('');

const isLoading = computed(() => {
  return store.is.fetching;
});

const list = computed(() => {
  return store.list
    .filter((item) => {
      const keyword = filter.value.toLowerCase();
      return (
        item.status
          .toLowerCase()
          .includes(keyword) ||
        item.item.retailer.toLowerCase().includes(keyword) ||
        item.item.properties?.brand
          .toLowerCase()
          .includes(keyword) ||
        item.item.properties?.model
          .toLowerCase()
          .includes(keyword) ||
        item.item.type.name.toLowerCase().includes(keyword) ||
        item.item.retailer.toLowerCase().includes(keyword) ||
        item.slug.toLowerCase().includes(keyword)
      );
    })
    .map((item) => {
      return {
        ...item,
        thumbnail: item.item.images[0]?.thumbnail ?? null,
      };
    });
});

function onRowClicked(row) {
  router.push({ name: 'tags', id: row.id });
  router.push({
    name: 'tagsShow',
    params: {
      id: row.id,
    },
  });
}

onMounted(() => {
  if (!isLoading.value) {
    store.fetch();
  }
});

const columns = [
  {
    name: 'createdAt',
    required: true,
    label: 'Created at',
    align: 'left',
    field: (row) => row.createdAt,
    format: (val) => date.formatDate(val, 'MMMM Do, YYYY HH:mm:ss'),
    sortable: true,
  },
  {
    name: 'retailer',
    required: false,
    label: 'Retailer',
    align: 'left',
    field: (row) => row.item.retailer,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: (row) => row.status,
    format: (val) => `${val}`.toUpperCase(),
    sortable: true,
  },
  {
    name: 'tagdSlug',
    required: true,
    label: 'Digital ID',
    align: 'left',
    field: (row) => row.slug,
    format: (val) => `${val}`,
    sortable: true,
  },
  // {
  //   name: 'item',
  //   required: false,
  //   label: 'Item',
  //   align: 'left',
  //   field: (row) => row.item.name,
  //   format: (val) => `${val}`,
  //   sortable: true,
  // },
  {
    name: 'type',
    required: false,
    label: 'Type',
    align: 'left',
    field: (row) => row.item.type.name ?? 'Unknown',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'brand',
    required: false,
    label: 'Brand',
    align: 'left',
    field: (row) => row.item.properties?.brand ?? 'Unknown',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'model',
    required: false,
    label: 'Model',
    align: 'left',
    field: (row) => row.item.properties?.model ?? 'Unknown',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'size',
    required: false,
    label: 'Size',
    align: 'left',
    field: (row) => row.item.properties?.size ?? 'Unknown',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'rrp',
    required: false,
    label: 'RRP',
    align: 'right',
    field: (row) =>
      (new Intl.NumberFormat().format(row.item.properties?.rrp) ?? 'Unknown')
      + (' ' + (row.item.properties?.currency ?? '')),
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'thumbnail',
    required: false,
    label: 'Thumbnail',
    align: 'center',
    field: (row) => row.thumbnail,
    sortable: true,
  },
];
</script>

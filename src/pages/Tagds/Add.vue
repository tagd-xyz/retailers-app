<template>
  <div class="q-pa-lg">
    <q-form @submit.prevent="onSubmit">
      <div class="row q-col-gutter-lg">
        <div class="col">
          <p class="text-h5">Item Details</p>
          <q-select v-model="stock" :options="stockAvailable" label="Item to be sold" hint="Select an item from stock"
            @update:model-value="onStockChange" :loading="isStockLoading" />

          <q-input v-model="data.serialNumber" label="Serial Number" hint="Enter the serial"
            placeholder="i.e. 99c95a90-9629-4a5f-8191-a76077714030" :disable="isPosting" />

          <q-separator class="q-my-lg" />

          <p class="text-h5">Sales details</p>
          <q-input v-model="data.consumer" label="Consumer" hint="Enter the email of the consumer"
            placeholder="i.e. john@gmail.com" :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
              (val) =>
                val.match(
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
                ) || 'Please write a valid email address',
            ]" :disable="isPosting" />

          <q-select v-model="data.country" :options="countries" label="Country" hint="Select a country from list"
            :loading="isPosting" />

          <q-input v-model="data.city" label="City" hint="Enter the city" placeholder="London" :rules="[
            (val) => (val && val.length > 0) || 'This field is required',
          ]" :disable="isPosting" />

          <q-select v-model="data.currency" :options="currencies" label="Currency" hint="Select a currency from list"
            :loading="isPosting" />

          <q-input v-model.number="data.amount" label="Amount" hint="Enter the amount" placeholder="i.e. 150"
            :rules="[(val) => (val && val > 0) || 'This field is required']" :disable="isPosting" />

          <q-input v-model="data.transaction" label="Transaction ID" hint="Enter the transaction ID"
            placeholder="i.e. 4926687623010" :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]" :disable="isPosting" />
        </div>
      </div>

      <q-separator color="primary" class="q-my-md" />

      <div class="column items-end">
        <div class="col">
          <q-btn label="Submit" type="submit" color="primary" :loading="isPosting" :disabled="!isSubmitEnabled" />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useItemsStore } from 'stores/items';
import { useStockStore } from 'stores/stock';
import { useRefStore } from 'stores/ref';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();

const itemsStore = useItemsStore();
const stockStore = useStockStore();
const refStore = useRefStore();

const $q = useQuasar();

const initialData = {
  name: '',
  description: '',
  type: '',
  properties: {},
  consumer: '',
  serialNumber: '',
  currency: null,
  amount: '',
  country: null,
  city: '',
  transaction: '',
  images: [],
};

const data = ref(initialData);
const stock = ref(null);

onMounted(() => {
  stockStore.fetchAll();
  refStore.fetchCurrencies();
  refStore.fetchCountries();
});

const stockAvailable = computed(() => {
  return stockStore.list.map((item) => {
    return {
      label: item.name,
      value: item,
    };
  });
});

const isStockLoading = computed(() => {
  return stockStore.is.fetching;
});

const currencies = computed(() => {
  return refStore.data.currencies.map((currency) => {
    return {
      label: `${currency.name} (${currency.symbol})`,
      value: currency.code,
    };
  });
});

const countries = computed(() => {
  return refStore.data.countries.map((country) => {
    return {
      label: `${country.name}`,
      value: country.code,
    };
  });
});

const isSubmitEnabled = computed(() => {
  return (
    data.value.name &&
    data.value.description &&
    data.value.type &&
    data.value.consumer &&
    data.value.transaction
  );
});

const isPosting = computed(() => {
  return itemsStore.isPosting;
});

const payload = computed(() => {
  return {
    name: data.value.name,
    description: data.value.description,
    type: data.value.type?.id,
    consumer: data.value.consumer,
    transaction: data.value.transaction,
    price: {
      currency: data.value.currency?.value ?? null,
      amount: data.value.amount,
    },
    location: {
      country: data.value.country?.value ?? null,
      city: data.value.city,
    },
    properties: {
      ...data.value.properties,
      retailerSerialNumber: data.value.serialNumber,
    },
    imageUploads: data.value.images,
  };
});

function onStockChange() {
  const item = stock.value.value;
  data.value = {
    ...data.value,
    name: item.name,
    description: item.description,
    type: item.type,
    properties: item.properties,
    images: item.images.map(function (image) {
      return image.uploadId;
    }),
  };
}

watch(stock, () => {
  if (stock.value) {
    const stockCurrency = stock.value.value.properties?.currency ?? 'GBP';
    if (stockCurrency) {
      const currency = currencies.value.find((currency) => {
        return currency.value === stockCurrency;
      });
      data.value.currency = currency;
    }
  }
});

watch(currencies, () => {
  const currency = currencies.value.find((currency) => {
    return currency.value === 'GBP';
  });
  data.value.currency = currency;
});

watch(countries, () => {
  const country = countries.value.find((country) => {
    return country.value === 'GBR';
  });
  data.value.country = country;
});

async function onSubmit() {
  itemsStore
    .add(payload.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Item added successfully',
      });
      router.push({ name: 'tags' });
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: 'There has been an error',
      });
    });
}
</script>

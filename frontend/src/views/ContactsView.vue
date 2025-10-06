<template>
  <div class="contacts-page">
    <v-container fluid>
      <h2 class="section-title mb-4">Contatos</h2>

      <!-- Toolbar -->
      <v-card class="mb-4" variant="outlined">
        <v-card-text>
          <v-row class="align-center" no-gutters>
            <v-col cols="12" md="4" class="pr-md-4 mb-3 mb-md-0">
              <v-text-field
                v-model="search"
                variant="outlined"
                density="comfortable"
                placeholder="Buscar por nome, telefone ou nota"
                prepend-inner-icon="mdi-magnify"
                clearable
                @keyup.enter="loadContacts"
              />
            </v-col>

            <v-col cols="12" md="8" class="d-flex justify-end ga-2 flex-wrap">
              <v-btn color="secondary" variant="tonal" @click="syncContacts" :loading="syncing">
                <v-icon start>mdi-sync</v-icon>
                Sincronizar Contatos
              </v-btn>
              <v-btn color="primary" @click="openCreateDialog">
                <v-icon start>mdi-account-plus</v-icon>
                Novo Contato
              </v-btn>
              <v-btn color="info" variant="tonal" @click="loadContacts" :loading="loading">
                <v-icon start>mdi-refresh</v-icon>
                Atualizar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Table -->
      <v-card variant="outlined">
        <v-data-table
          :headers="headers"
          :items="contacts"
          :loading="loading"
          item-key="_id"
          class="contacts-table"
          :items-per-page="10"
          :no-data-text="loading ? 'Carregando...' : 'Nenhum contato encontrado'"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center ga-2">
              <v-avatar color="primary" variant="tonal" size="28">
                <v-icon size="18">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.phone }}</div>
              </div>
            </div>
          </template>

          <template #item.labels="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip v-for="(label, i) in item.labels" :key="i" size="small" color="info" variant="tonal">
                {{ label }}
              </v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-tooltip text="Iniciar conversa">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small" color="success" @click="startChat(item)">
                    <v-icon size="18">mdi-whatsapp</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Editar">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small" color="primary" @click="openEditDialog(item)">
                    <v-icon size="18">mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Excluir">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small" color="error" @click="confirmDelete(item)">
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog: Create/Edit Contact -->
      <v-dialog v-model="contactDialog" max-width="520">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">{{ editing ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
            {{ editing ? 'Editar Contato' : 'Novo Contato' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="contactFormRef" v-model="contactFormValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="contactForm.name" label="Nome" variant="outlined" :rules="[rules.required]" />
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="contactForm.phone" label="Telefone" variant="outlined" :rules="[rules.required]" />
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="contactForm.labels"
                    :items="labelOptions"
                    label="Tags"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="contactForm.notes" label="Observações" variant="outlined" rows="3" />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="tonal" @click="closeContactDialog">Cancelar</v-btn>
            <v-btn color="primary" :loading="saving" @click="saveContact">{{ editing ? 'Salvar' : 'Criar' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog: Delete Confirmation -->
      <v-dialog v-model="deleteDialog" max-width="440">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="error">mdi-delete</v-icon>
            Excluir Contato
          </v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir o contato
            <strong>{{ selectedContact?.name }}</strong> ({{ selectedContact?.phone }})?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="tonal" @click="deleteDialog = false">Cancelar</v-btn>
            <v-btn color="error" :loading="deleting" @click="deleteContact">Excluir</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'ContactsView',
  setup() {
    const headers = [
      { title: 'Contato', key: 'name' },
      { title: 'Tags', key: 'labels', sortable: false },
      { title: 'Observações', key: 'notes', sortable: false },
      { title: 'Ações', key: 'actions', sortable: false, align: 'end' }
    ]

    const contacts = ref([])
    const loading = ref(false)
    const syncing = ref(false)
    const saving = ref(false)
    const deleting = ref(false)

    const search = ref('')

    const contactDialog = ref(false)
    const deleteDialog = ref(false)
    const editing = ref(false)

    const selectedContact = ref(null)

    const contactFormRef = ref(null)
    const contactFormValid = ref(false)
    const contactForm = reactive({
      name: '',
      phone: '',
      labels: [],
      notes: ''
    })

    const labelOptions = ref(['Cliente', 'Lead', 'Fornecedor', 'VIP'])

    const rules = {
      required: v => !!v || 'Obrigatório'
    }

    const loadContacts = async () => {
      loading.value = true
      try {
        const url = new URL('http://localhost:3001/contacts')
        if (search.value) url.searchParams.set('search', search.value)
        const response = await fetch(url)
        const data = await response.json()
        contacts.value = data
      } catch (e) {
        console.error('Erro ao carregar contatos:', e)
      } finally {
        loading.value = false
      }
    }

    const syncContacts = async () => {
      syncing.value = true
      try {
        const response = await fetch('http://localhost:3001/contacts/sync', { method: 'POST' })
        const result = await response.json()
        console.log('Sincronização:', result)
        await loadContacts()
      } catch (e) {
        console.error('Erro ao sincronizar contatos:', e)
      } finally {
        syncing.value = false
      }
    }

    const openCreateDialog = () => {
      editing.value = false
      Object.assign(contactForm, { name: '', phone: '', labels: [], notes: '' })
      contactDialog.value = true
    }

    const openEditDialog = (item) => {
      editing.value = true
      selectedContact.value = item
      Object.assign(contactForm, { name: item.name, phone: item.phone, labels: [...(item.labels||[])], notes: item.notes || '' })
      contactDialog.value = true
    }

    const closeContactDialog = () => {
      contactDialog.value = false
    }

    const saveContact = async () => {
      const form = contactFormRef.value
      if (form) {
        const valid = await form.validate()
        if (!valid.valid) return
      }
      saving.value = true
      try {
        const payload = { ...contactForm }
        if (editing.value && selectedContact.value) {
          const response = await fetch(`http://localhost:3001/contacts/${selectedContact.value._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!response.ok) throw new Error('Falha ao salvar contato')
        } else {
          const response = await fetch('http://localhost:3001/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!response.ok) throw new Error('Falha ao criar contato')
        }
        contactDialog.value = false
        await loadContacts()
      } catch (e) {
        console.error('Erro ao salvar contato:', e)
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (item) => {
      selectedContact.value = item
      deleteDialog.value = true
    }

    const deleteContact = async () => {
      deleting.value = true
      try {
        const response = await fetch(`http://localhost:3001/contacts/${selectedContact.value._id}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Falha ao excluir contato')
        deleteDialog.value = false
        await loadContacts()
      } catch (e) {
        console.error('Erro ao excluir contato:', e)
      } finally {
        deleting.value = false
      }
    }

    const startChat = (item) => {
      // Navegação para a tela de chat com filtro do contato
      window.location.href = `/chat?to=${encodeURIComponent(item.phone)}&name=${encodeURIComponent(item.name)}`
    }

    onMounted(() => {
      loadContacts()
    })

    return {
      headers,
      contacts,
      loading,
      syncing,
      saving,
      deleting,
      search,
      contactDialog,
      deleteDialog,
      editing,
      contactFormRef,
      contactFormValid,
      contactForm,
      labelOptions,
      rules,
      selectedContact,
      loadContacts,
      syncContacts,
      openCreateDialog,
      openEditDialog,
      closeContactDialog,
      saveContact,
      confirmDelete,
      deleteContact,
      startChat
    }
  }
}
</script>

<style scoped>
.contacts-page {
  padding: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
}

.contacts-table {
  min-height: 360px;
}
</style>

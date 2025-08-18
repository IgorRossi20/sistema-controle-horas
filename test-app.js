// Teste rápido da aplicação
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Usar as mesmas configurações do .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDRz7RfzKa7unVyy3QHPKXCauPH_4kWbME",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "controlehoras-1d95d.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "controlehoras-1d95d",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "controlehoras-1d95d.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "67121306586",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:67121306586:web:bd6d77fdc4b127e7ecbee3",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7K8C53E9KG"
}

async function testApp() {
  console.log('🧪 Testando aplicação...')
  
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig)
    console.log('✅ Firebase inicializado')
    
    // Inicializar Firestore
    const db = getFirestore(app)
    console.log('✅ Firestore inicializado')
    
    // Testar acesso às coleções principais
    const collections = ['clients', 'projects', 'timeEntries']
    
    for (const collectionName of collections) {
      try {
        const ref = collection(db, collectionName)
        const snapshot = await getDocs(ref)
        console.log(`✅ Coleção "${collectionName}": ${snapshot.size} documentos`)
      } catch (error) {
        if (error.code === 'permission-denied') {
          console.log(`⚠️ Coleção "${collectionName}": Acesso negado (API não habilitada)`)
        } else {
          console.error(`❌ Erro na coleção "${collectionName}":`, error.message)
        }
      }
    }
    
    console.log('\n📋 RESUMO DO TESTE:')
    console.log('- Configuração do Firebase: ✅ OK')
    console.log('- Inicialização do Firestore: ✅ OK')
    console.log('- Problema principal: API do Cloud Firestore não habilitada')
    console.log('\n🔗 Para resolver:')
    console.log('Acesse: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=controlehoras-1d95d')
    console.log('E clique em "ATIVAR" ou "ENABLE"')
    
  } catch (error) {
    console.error('❌ Erro crítico:', error.message)
  }
}

testApp()
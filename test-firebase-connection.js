// Teste de conexão com Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRz7RfzKa7unVyy3QHPKXCauPH_4kWbME",
  authDomain: "controlehoras-1d95d.firebaseapp.com",
  projectId: "controlehoras-1d95d",
  storageBucket: "controlehoras-1d95d.firebasestorage.app",
  messagingSenderId: "67121306586",
  appId: "1:67121306586:web:bd6d77fdc4b127e7ecbee3",
  measurementId: "G-7K8C53E9KG"
}

async function testFirebaseConnection() {
  try {
    console.log('🚀 Testando conexão com Firebase...')
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase inicializado com sucesso')
    
    // Testar leitura de uma coleção
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    
    console.log('✅ Conexão com Firestore funcionando')
    console.log(`📊 Encontrados ${snapshot.size} projetos`)
    
    snapshot.forEach((doc) => {
      console.log('📄 Projeto:', doc.id, doc.data())
    })
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
    console.error('📋 Detalhes do erro:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
  }
}

// Executar teste
testFirebaseConnection()
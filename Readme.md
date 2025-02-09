# Bank Contract & WebApp

Este repositorio contiene un contrato inteligente de un banco basado en Ethereum y una interfaz web para interactuar con el contrato. El banco permite a los usuarios realizar operaciones de depósito, retiro y transferencia de fondos, además de contar con una calculadora de interés para estimar las ganancias por el saldo acumulado.

## Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- Node.js (v16 o superior)
- npm (se instala automáticamente con Node.js)
- Hardhat (para el desarrollo de contratos inteligentes)
- Metamask (para interactuar con la red Ethereum en el navegador)

## Instalación y Configuración

Sigue estos pasos para configurar el entorno y ejecutar el proyecto localmente:

### 1. Configuración del contrato inteligente

Colócate en la carpeta del contrato Bank:

```bash
cd Bank
```
Inicia las dependencias:
```
npm install
```
Compila el contrato
```
npx hardhat compile
```
Ejecuta un nodo de Hardhat para la red local:
```
npx hardhat node
```
Esto iniciará una instancia local de Ethereum en la red localhost. Deberás dejar esta consola abierta mientras trabajas con el proyecto.

### 2. Despliegue del contrato
Abre una nueva terminal, colócate nuevamente en la carpeta Bank y despliega el contrato en la red local:
```
npx hardhat ignition deploy ./ignition/modules/BankModule.js --network localhost
```
Este comando desplegará el contrato del banco en la red local que creaste anteriormente.

### 3. Configuración del frontend
Abre otra nueva terminal y colócate en la carpeta WebBank:
```
cd WebBank
```
Instala las dependencias necesarias para el frontend:
```
npm i
```
Inicia el servidor de desarrollo con el siguiente comando:
```
npm run serve
```
## Funciones del Banco
El contrato inteligente ofrece las siguientes funcionalidades:

 - Depositar dinero: Los usuarios pueden depositar fondos en su cuenta del banco.
 - Retirar dinero: Los usuarios pueden retirar fondos de su cuenta bancaria, siempre que haya suficiente saldo.
 - Transferir dinero: Los usuarios pueden transferir dinero desde su cuenta bancaria a otra cuenta.
 - Calculadora de interés: Los usuarios pueden simular cuánto ganarán en intereses según su saldo y un período de tiempo especificado.
 - Interacción con la interfaz web
 - Desde la interfaz web, los usuarios pueden realizar las siguientes acciones:

 - Ver el saldo actual.
 - Ver los intereses acumulados.
 - Simular intereses: Ingresa el número de días para calcular los intereses que tu saldo ganaría.
 - Depositar dinero: Ingresa una cantidad de ETH para depositar en tu cuenta bancaria.
 - Retirar dinero: Ingresa una cantidad de ETH para retirar de tu cuenta bancaria.
 - Transferir dinero: Ingresa la dirección de la cuenta de destino y la cantidad a transferir.

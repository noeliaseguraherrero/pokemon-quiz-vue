# PokéQuiz - Guess the Pokémon 🎮⚡

![Responsive Design](https://img.shields.io/badge/Responsive-Design-2ea44f?style=for-the-badge&logo=airplay)

> **Aplicación Web con Vue 3 y TypeScript**
Un juego interactivo de adivinar el Pokémon basado en siluetas, desarrollado con Vue 3, TypeScript y la PokéAPI. Está diseñado con una estructura limpia y organizada por carpetas, utilizando composables para separar la lógica del juego de la parte visual. Además, la interfaz es 100% adaptable, por lo que se puede jugar perfectamente tanto en móviles como en ordenadores. Cuenta con un sistema de dificultades dinámicas, gestión de vidas, niveles, estadísticas en tiempo real y una Pokédex desbloqueable.

## 📋 Funcionalidades Principales

### ⚙️ Sistema de Juego y Dificultades
* **Dificultad Dinámica:** Panel lateral para seleccionar el nivel de desafío que altera el renderizado de opciones:
    * **Baja:** Muestra 2 opciones de respuesta.
    * **Media:** Muestra 4 opciones de respuesta.
    * **Alta:** Muestra 6 opciones de respuesta.
* **Mecánica de Supervivencia:** Gestión en tiempo real de una barra de vida (HP), niveles de jugador y ganancia de experiencia (EXP) tras cada acierto.

### 🗂️ Progreso y Colección
* **Pokédex Desbloqueable:** Registro interactivo de avistamientos que se actualiza y desbloquea a los Pokémon conforme se aciertan en partida (Progreso de 0/151).
* **Perfil e Insignias:** Panel de estadísticas que rastrea la racha actual, la mejor racha histórica, victorias totales y otorga insignias de perfil por logros conseguidos.
* **Persistencia de Datos:** Guardado automático local para mantener el progreso de la Pokédex, récords y medallas al cerrar la sesión.

## 💻 Tecnologías Utilizadas
* **Frontend Framework:** Vue 3 con la Composition API.
* **Lenguaje:** TypeScript para control estricto de tipos mediante interfaces y enums.
* **Estilos:** CSS3 nativo avanzado con enfoque Mobile-First y animaciones personalizadas.
* **API Externa:** PokéAPI REST para la obtención y carga asíncrona de datos y sprites.

## 📁 Estructura del Proyecto

El código está organizado por módulos y componentes reutilizables mediante una arquitectura limpia:

```text
src/
├── assets/             # Estilos globales y animaciones de combate
├── modules/pokemon/    # Módulo principal del juego
│   ├── api/            # Configuración de Axios/Fetch para PokéAPI
│   ├── components/     # BattleHUD, PokemonDex, PokemonOptions, PokemonPicture
│   ├── composables/    # Lógica de juego central (usePokemonGame, useStorage)
│   ├── interfaces/     # Tipados y Enums (game-status, respuestas de API)
│   └── pages/          # Pantallas principales (IntroScreen, PokemonGame)
├── App.vue             # Componente raíz
└── main.ts             # Punto de entrada de la aplicación

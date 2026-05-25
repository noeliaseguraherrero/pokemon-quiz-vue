# PokéQuiz 🎮⚡

¡Bienvenido a **PokéQuiz**! Un juego web interactivo e intuitivo basado en el clásico "¿Quién es ese Pokémon?". El objetivo es identificar al Pokémon oculto tras la silueta seleccionando la opción correcta entre múltiples alternativas que varían según la dificultad elegida.

---

## ✨ Características Principales

* **Dificultad Dinámica:** Elige tu nivel de desafío en el panel lateral:
    * 🟢 **Fácil:** 2 opciones de respuesta.
    * 🟡 **Media:** 4 opciones de respuesta.
    * 🔴 **Difícil:** 6 opciones de respuesta.
* **Sistema de Progreso y Supervivencia:** Control de niveles, experiencia (EXP) y barra de vida (HP) del jugador.
* **Pokédex Desbloqueable:** Registra y colecciona todos los Pokémon que vayas descubriendo y acertando a lo largo de tus partidas (Progreso de 0/151).
* **Estadísticas y Logros:** Panel en tiempo real que rastrea tus victorias, derrotas, racha actual, mejor racha histórica e insignias de perfil desbloqueadas.
* **Persistencia de Datos:** Guardado local para mantener tus récords e insignias a través de sesiones.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto ha sido estructurado siguiendo las mejores prácticas de modularidad y escalabilidad:

* **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto para respuestas de API y estados)
* **Estilos:** CSS3 nativo / Animaciones personalizadas
* **API Externa:** [PokéAPI](https://pokeapi.co/) para la obtención dinámica de los datos y sprites de los Pokémon.

---

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

import psycopg2
import random
import json

questions_mcm = [
  {
    "id": 1,
    "pregunta": "Un faro del puerto enciende su luz azul cada 2 minutos y su luz roja cada 3 minutos. Si ambas luces se acaban de encender al mismo tiempo, ¿en cuántos minutos volverán a coincidir?",
    "opciones": {
      "A": "5 minutos",
      "B": "6 minutos",
      "C": "12 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 2,
    "pregunta": "En un jardín, el cactus se riega cada 2 días y el helecho cada 3 días. Si hoy regaste ambas plantas, ¿dentro de cuántos días volverás a regarlas el mismo día?",
    "opciones": {
      "A": "6 días",
      "B": "5 días",
      "C": "10 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 3,
    "pregunta": "Un perrito debe tomar su pastilla para las pulgas cada 2 horas y sus vitaminas cada 3 horas. Si le diste ambas a las 8:00 a.m., ¿cuántas horas deben pasar para que le toquen las dos juntas de nuevo?",
    "opciones": {
      "A": "4 horas",
      "B": "6 horas",
      "C": "8 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 4,
    "pregunta": "En la escuela de música, la clase de guitarra es cada 3 días y la de piano cada 4 días. Si hoy tuviste ambas, ¿en cuántos días volverás a tener las dos clases el mismo día?",
    "opciones": {
      "A": "12 días",
      "B": "7 días",
      "C": "24 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 5,
    "pregunta": "En una fábrica, la máquina de juguetes de madera hace un sonido cada 3 minutos y la de plástico cada 4 minutos. ¿En cuántos minutos sonarán las dos al mismo tiempo?",
    "opciones": {
      "A": "15 minutos",
      "B": "12 minutos",
      "C": "7 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 6,
    "pregunta": "El autobús rojo pasa por la parada cada 3 minutos y el azul cada 4 minutos. Si acaban de pasar juntos, ¿cuántos minutos tardarán en volver a coincidir?",
    "opciones": {
      "A": "12 minutos",
      "B": "6 minutos",
      "C": "16 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 7,
    "pregunta": "A Juan le toca sacar la basura cada 4 días y lavar los platos cada 5 días. Si hoy hizo las dos tareas, ¿dentro de cuántos días tendrá que volver a hacer ambas cosas juntas?",
    "opciones": {
      "A": "9 días",
      "B": "40 días",
      "C": "20 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 8,
    "pregunta": "En una tienda, revisan el inventario de juguetes cada 4 semanas y el de ropa cada 5 semanas. ¿Cada cuántas semanas coinciden ambas revisiones?",
    "opciones": {
      "A": "20 semanas",
      "B": "9 semanas",
      "C": "15 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 9,
    "pregunta": "En un árbol de Navidad, las estrellas brillan cada 4 segundos y las esferas cada 5 segundos. ¿En cuántos segundos brillarán todas a la vez?",
    "opciones": {
      "A": "10 segundos",
      "B": "20 segundos",
      "C": "40 segundos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 10,
    "pregunta": "Sofía come helado cada 5 días y va al parque cada 2 días. Si hoy hizo las dos cosas, ¿dentro de cuántos días volverá a repetirse este día tan divertido?",
    "opciones": {
      "A": "10 días",
      "B": "7 días",
      "C": "15 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 11,
    "pregunta": "Dos relojes cucú están en la misma pared. Uno canta cada 2 minutos y el otro cada 5 minutos. ¿Cada cuántos minutos cantan los dos pajaritos a la vez?",
    "opciones": {
      "A": "10 minutos",
      "B": "20 minutos",
      "C": "7 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 12,
    "pregunta": "En una avenida plantan un árbol cada 2 metros y ponen un poste de luz cada 5 metros. ¿A los cuántos metros habrá un árbol y un poste de luz juntos por primera vez?",
    "opciones": {
      "A": "7 metros",
      "B": "10 metros",
      "C": "20 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 13,
    "pregunta": "Lucas visita a sus abuelos cada 3 días y a sus tíos cada 5 días. ¿Cada cuántos días coincide para visitar a toda la familia?",
    "opciones": {
      "A": "15 días",
      "B": "8 días",
      "C": "30 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 14,
    "pregunta": "El camión de reciclaje de cartón pasa cada 3 horas y el de plástico cada 5 horas. ¿En cuántas horas pasarán ambos camiones juntos otra vez?",
    "opciones": {
      "A": "15 horas",
      "B": "8 horas",
      "C": "20 horas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 15,
    "pregunta": "Una alarma del celular suena cada 3 minutos y otra de un reloj suena cada 5 minutos. ¿Cuándo volverán a sonar las dos juntas?",
    "opciones": {
      "A": "A los 8 minutos",
      "B": "A los 15 minutos",
      "C": "A los 30 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 16,
    "pregunta": "Martín entrena fútbol cada 4 días y natación cada 6 días. Si hoy tuvo ambos entrenamientos, ¿dentro de cuántos días tendrá un día igual de ocupado?",
    "opciones": {
      "A": "10 días",
      "B": "12 días",
      "C": "24 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 17,
    "pregunta": "La feria del pueblo llega cada 4 meses y el circo cada 6 meses. ¿Cada cuántos meses coinciden la feria y el circo en el pueblo?",
    "opciones": {
      "A": "12 meses",
      "B": "10 meses",
      "C": "24 meses"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 18,
    "pregunta": "Una rana de juguete salta cada 4 segundos y una de verdad cada 6 segundos. Si saltaron juntas justo ahora, ¿en cuántos segundos volverán a coincidir en el salto?",
    "opciones": {
      "A": "10 segundos",
      "B": "24 segundos",
      "C": "12 segundos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 19,
    "pregunta": "Leo lee un libro nuevo cada 6 días y ve una película nueva cada 8 días. ¿Cada cuántos días termina un libro y ve una película el mismo día?",
    "opciones": {
      "A": "14 días",
      "B": "48 días",
      "C": "24 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 20,
    "pregunta": "En la torre, la campana grande suena cada 8 minutos y la pequeña cada 6 minutos. ¿En cuántos minutos sonarán las dos juntas?",
    "opciones": {
      "A": "24 minutos",
      "B": "14 minutos",
      "C": "48 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 21,
    "pregunta": "Dos satélites orbitan la Tierra. Uno da la vuelta cada 6 horas y el otro cada 8 horas. Si pasaron sobre tu ciudad a la vez, ¿en cuántas horas volverán a hacerlo?",
    "opciones": {
      "A": "48 horas",
      "B": "24 horas",
      "C": "14 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 22,
    "pregunta": "El club de lectura se reúne cada 5 días y el de ciencias cada 6 días. ¿Cada cuántos días coinciden las dos reuniones?",
    "opciones": {
      "A": "11 días",
      "B": "15 días",
      "C": "30 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 23,
    "pregunta": "En un parque de diversiones, el tren rápido da una vuelta cada 5 minutos y el lento cada 6 minutos. ¿En qué minuto exacto vuelven a salir juntos de la estación?",
    "opciones": {
      "A": "A los 30 minutos",
      "B": "A los 11 minutos",
      "C": "A los 60 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 24,
    "pregunta": "Un torneo de ajedrez se celebra cada 5 semanas y uno de damas chinas cada 6 semanas. ¿Cada cuántas semanas coinciden ambos torneos?",
    "opciones": {
      "A": "30 semanas",
      "B": "11 semanas",
      "C": "60 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 25,
    "pregunta": "Emma pasea en bicicleta cada 2 días y va a nadar cada 7 días. Si hoy hizo las dos cosas, ¿cuántos días pasarán hasta que vuelva a repetir ambas actividades juntas?",
    "opciones": {
      "A": "9 días",
      "B": "14 días",
      "C": "21 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 26,
    "pregunta": "Un reloj de arena pequeño se vacía cada 2 horas y uno grande cada 7 horas. Si los volteas al mismo tiempo, ¿en cuántas horas terminarán de vaciarse exactamente a la vez?",
    "opciones": {
      "A": "14 horas",
      "B": "9 horas",
      "C": "28 horas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 27,
    "pregunta": "En un pasillo largo, ponen una baldosa roja cada 2 metros y una azul cada 7 metros. ¿A los cuántos metros coincidirán una baldosa roja y una azul?",
    "opciones": {
      "A": "9 metros",
      "B": "14 metros",
      "C": "21 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 28,
    "pregunta": "En casa cenan pizza cada 7 días y hamburguesas cada 3 días. ¿Cada cuántos días hay una gran fiesta con ambas comidas juntas?",
    "opciones": {
      "A": "21 días",
      "B": "10 días",
      "C": "42 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 29,
    "pregunta": "El tren de la línea verde pasa cada 3 minutos y el de la línea amarilla cada 7 minutos. ¿Cada cuántos minutos coinciden ambos trenes en la estación principal?",
    "opciones": {
      "A": "21 minutos",
      "B": "10 minutos",
      "C": "42 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 30,
    "pregunta": "En clase de arte usan acuarelas cada 3 semanas y arcilla cada 7 semanas. ¿Cada cuántas semanas les toca usar ambos materiales?",
    "opciones": {
      "A": "10 semanas",
      "B": "21 semanas",
      "C": "42 semanas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 31,
    "pregunta": "El camión de la basura pasa por tu calle cada 4 días y el del reciclaje cada 10 días. ¿En cuántos días coincidirán los dos camiones el mismo día?",
    "opciones": {
      "A": "14 días",
      "B": "40 días",
      "C": "20 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 32,
    "pregunta": "En un semáforo especial, la luz amarilla destella cada 4 segundos y la blanca cada 10 segundos. ¿En cuántos segundos destellarán juntas?",
    "opciones": {
      "A": "20 segundos",
      "B": "40 segundos",
      "C": "14 segundos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 33,
    "pregunta": "En un parque, colocan un basurero cada 4 metros y una banca cada 10 metros. ¿A los cuántos metros encontrarás un basurero y una banca juntos?",
    "opciones": {
      "A": "14 metros",
      "B": "20 metros",
      "C": "40 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 34,
    "pregunta": "Papá compra una revista deportiva cada 6 días y una de ciencias cada 10 días. ¿Cada cuántos días irá al quiosco a comprar ambas revistas a la vez?",
    "opciones": {
      "A": "60 días",
      "B": "30 días",
      "C": "16 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 35,
    "pregunta": "En la televisión, un programa de animales dura 6 minutos y uno de dibujos 10 minutos (incluyendo cortes). Si ambos empiezan al mismo tiempo, ¿en cuántos minutos volverán a empezar juntos nuevos episodios?",
    "opciones": {
      "A": "16 minutos",
      "B": "60 minutos",
      "C": "30 minutos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 36,
    "pregunta": "Mamá cambia la esponja de los platos cada 6 semanas y el filtro del agua cada 10 semanas. ¿Cada cuántas semanas hará ambos cambios al mismo tiempo?",
    "opciones": {
      "A": "30 semanas",
      "B": "16 semanas",
      "C": "60 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 37,
    "pregunta": "Hay que cortar el césped cada 9 días y regar las flores grandes cada 6 días. ¿Cada cuántos días coinciden las dos tareas en el jardín?",
    "opciones": {
      "A": "18 días",
      "B": "15 días",
      "C": "54 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 38,
    "pregunta": "Un avión hace la ruta al norte cada 6 horas y otro a la ruta sur cada 9 horas. Si despegaron juntos, ¿cuántas horas deben pasar para que vuelvan a despegar al mismo tiempo?",
    "opciones": {
      "A": "15 horas",
      "B": "18 horas",
      "C": "54 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 39,
    "pregunta": "Se revisan los frenos de una bicicleta cada 6 meses y las llantas cada 9 meses. ¿Cada cuántos meses se le hace la revisión completa de ambas partes?",
    "opciones": {
      "A": "18 meses",
      "B": "15 meses",
      "C": "36 meses"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 40,
    "pregunta": "Los scouts tienen reunión de patrulla cada 8 días y excursión al bosque cada 12 días. ¿Cada cuántos días tienen reunión y excursión el mismo día?",
    "opciones": {
      "A": "24 días",
      "B": "20 días",
      "C": "96 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 41,
    "pregunta": "Un barco turístico sale del muelle cada 8 minutos y un ferry cada 12 minutos. ¿En cuántos minutos saldrán ambos al mismo tiempo?",
    "opciones": {
      "A": "24 minutos",
      "B": "20 minutos",
      "C": "48 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 42,
    "pregunta": "En una fábrica, suena un timbre cada 8 horas y suena una sirena de cambio de turno cada 12 horas. ¿Cada cuántas horas coinciden ambos sonidos?",
    "opciones": {
      "A": "48 horas",
      "B": "24 horas",
      "C": "20 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 43,
    "pregunta": "El equipo de béisbol de la escuela juega en casa cada 10 días y el de fútbol cada 15 días. ¿Dentro de cuántos días jugarán ambos equipos en la escuela el mismo día?",
    "opciones": {
      "A": "25 días",
      "B": "150 días",
      "C": "30 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 44,
    "pregunta": "Un pastelero saca una bandeja de galletas cada 10 minutos y una de pan cada 15 minutos. ¿Cada cuántos minutos saca ambos alimentos del horno al mismo tiempo?",
    "opciones": {
      "A": "25 minutos",
      "B": "30 minutos",
      "C": "60 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 45,
    "pregunta": "Un paseador lleva al parque a un perro dálmata cada 3 días y a un bulldog cada 8 días. ¿Cada cuántos días se encontrarán ambos perros en el parque?",
    "opciones": {
      "A": "11 días",
      "B": "24 días",
      "C": "48 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 46,
    "pregunta": "Hay una competencia de matemáticas en el colegio cada 3 semanas y una de deletreo cada 8 semanas. ¿Cada cuántas semanas hay dos competencias en la misma semana?",
    "opciones": {
      "A": "24 semanas",
      "B": "11 semanas",
      "C": "48 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 47,
    "pregunta": "Tres amigos van a la biblioteca: Ana va cada 2 días, Beto cada 3 días y Carlos cada 4 días. Si hoy coincidieron, ¿en cuántos días volverán a encontrarse los tres juntos?",
    "opciones": {
      "A": "9 días",
      "B": "12 días",
      "C": "24 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 48,
    "pregunta": "En un videojuego, aparecen monedas cada 2 segundos, escudos cada 3 segundos y estrellas cada 4 segundos. ¿En cuántos segundos aparecerán los tres objetos al mismo tiempo?",
    "opciones": {
      "A": "9 segundos",
      "B": "24 segundos",
      "C": "12 segundos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 49,
    "pregunta": "Tres barcos piratas regresan a su isla secreta: el primer barco cada 3 meses, el segundo cada 4 meses y el tercero cada 5 meses. ¿En cuántos meses se encontrarán los tres barcos en la isla?",
    "opciones": {
      "A": "12 meses",
      "B": "60 meses",
      "C": "20 meses"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 50,
    "pregunta": "En una pista de carreras, el auto rojo da una vuelta en 3 minutos, el azul en 4 minutos y el amarillo en 5 minutos. Si todos arrancaron de la meta al mismo tiempo, ¿en cuántos minutos volverán a cruzar los tres juntos por la meta?",
    "opciones": {
      "A": "60 minutos",
      "B": "12 minutos",
      "C": "120 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  }
]

questions_mcd = [
  {
    "id": 1,
    "pregunta": "Luis tiene 12 manzanas y 18 peras. Quiere armar fruteros iguales con la mayor cantidad de fruta posible sin que sobre nada. ¿Cuántos fruteros iguales puede armar como máximo?",
    "opciones": {
      "A": "6 fruteros",
      "B": "2 fruteros",
      "C": "3 fruteros"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 2,
    "pregunta": "En una papelería hay 20 borradores y 30 sacapuntas. Quieren hacer paquetes escolares idénticos usando todos los artículos. ¿Cuál es el mayor número de paquetes que pueden hacer?",
    "opciones": {
      "A": "5 paquetes",
      "B": "10 paquetes",
      "C": "2 paquetes"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 3,
    "pregunta": "Un carpintero tiene dos tablas de madera, una de 16 cm y otra de 24 cm. Quiere cortarlas en pedazos iguales lo más grandes posible sin desperdiciar madera. ¿De cuántos centímetros será cada pedazo?",
    "opciones": {
      "A": "4 cm",
      "B": "8 cm",
      "C": "6 cm"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 4,
    "pregunta": "Ana hizo 15 galletas de chocolate y 20 de vainilla. Quiere ponerlas en platos idénticos sin que sobre ninguna galleta. ¿Cuál es la mayor cantidad de platos que puede usar?",
    "opciones": {
      "A": "10 platos",
      "B": "3 platos",
      "C": "5 platos"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 5,
    "pregunta": "Para unas olimpiadas escolares hay 24 niños y 36 niñas. El profesor quiere armar equipos iguales en tamaño y género. ¿Cuál es el mayor número de estudiantes que puede tener cada equipo?",
    "opciones": {
      "A": "6 estudiantes",
      "B": "12 estudiantes",
      "C": "8 estudiantes"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 6,
    "pregunta": "Una floristería tiene 8 rosas y 12 tulipanes. Quieren hacer el mayor número de ramos idénticos sin que sobren flores. ¿Cuántos ramos pueden armar?",
    "opciones": {
      "A": "4 ramos",
      "B": "2 ramos",
      "C": "6 ramos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 7,
    "pregunta": "Carlos tiene 10 calcomanías de dinosaurios y 15 de naves. Quiere repartirlas a sus amigos de forma que todos reciban lo mismo y no sobre nada. ¿A cuántos amigos como máximo se las puede regalar?",
    "opciones": {
      "A": "3 amigos",
      "B": "5 amigos",
      "C": "2 amigos"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 8,
    "pregunta": "Marta tiene 18 perlas rojas y 27 perlas azules. Quiere hacer pulseras idénticas con la mayor cantidad posible de perlas. ¿Cuántas pulseras iguales podrá hacer?",
    "opciones": {
      "A": "6 pulseras",
      "B": "3 pulseras",
      "C": "9 pulseras"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 9,
    "pregunta": "En una tienda de juguetes hay 14 carritos y 21 motos. Se quieren empacar en cajas idénticas sin mezclar distintos tipos ni que sobren. ¿Cuántas cajas como máximo se pueden usar?",
    "opciones": {
      "A": "7 cajas",
      "B": "3 cajas",
      "C": "14 cajas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 10,
    "pregunta": "La abuela tiene dos rollos de cinta, uno de 40 cm y otro de 60 cm. Quiere cortar moños del mismo tamaño y lo más largos posible. ¿De cuántos centímetros será cada moño?",
    "opciones": {
      "A": "10 cm",
      "B": "20 cm",
      "C": "30 cm"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 11,
    "pregunta": "Se tienen 30 bloques rojos y 45 bloques azules. Se quieren construir torres idénticas usando la mayor cantidad posible de torres sin que sobren bloques. ¿Cuántas torres iguales se pueden hacer?",
    "opciones": {
      "A": "5 torres",
      "B": "15 torres",
      "C": "10 torres"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 12,
    "pregunta": "Sofía tiene 12 lápices y 16 bolígrafos. Quiere armar estuches idénticos para donar, sin que le sobre nada. ¿Cuál es el mayor número de estuches que puede armar?",
    "opciones": {
      "A": "2 estuches",
      "B": "4 estuches",
      "C": "6 estuches"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 13,
    "pregunta": "En una fiesta hay 24 porciones de pizza y 32 de pastel. Se quieren armar platos idénticos para los invitados. ¿A cuántos invitados se les puede dar un plato exacto como máximo?",
    "opciones": {
      "A": "12 invitados",
      "B": "6 invitados",
      "C": "8 invitados"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 14,
    "pregunta": "Un mago tiene 18 cartas rojas y 24 cartas negras. Quiere hacer montones idénticos con la mayor cantidad de cartas posible sin que sobren. ¿Cuántos montones puede hacer?",
    "opciones": {
      "A": "6 montones",
      "B": "3 montones",
      "C": "12 montones"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 15,
    "pregunta": "En un campamento hay 20 jugos de manzana y 25 de naranja. Se quieren repartir en hieleras idénticas sin que sobre ninguno. ¿Cuál es el mayor número de hieleras que se pueden preparar?",
    "opciones": {
      "A": "10 hieleras",
      "B": "5 hieleras",
      "C": "4 hieleras"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 16,
    "pregunta": "El profesor de gimnasia tiene un grupo de 28 niños y otro de 42 niñas. Quiere dividirlos en equipos del mismo tamaño. ¿Cuál es el mayor número de integrantes que puede tener cada equipo?",
    "opciones": {
      "A": "14 integrantes",
      "B": "7 integrantes",
      "C": "4 integrantes"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 17,
    "pregunta": "Tenemos 36 canicas verdes y 48 azules. Queremos guardarlas en bolsas iguales con la mayor cantidad posible sin que sobre ninguna. ¿Cuántas bolsas iguales podemos hacer?",
    "opciones": {
      "A": "6 bolsas",
      "B": "8 bolsas",
      "C": "12 bolsas"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 18,
    "pregunta": "Un granjero tiene 45 semillas de tomate y 60 de zanahoria. Quiere plantarlas en filas idénticas con la misma cantidad de semillas cada una. ¿Cuántas filas como máximo puede hacer?",
    "opciones": {
      "A": "15 filas",
      "B": "9 filas",
      "C": "5 filas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 19,
    "pregunta": "En una panadería tienen 50 gramos de chispas de chocolate y 75 gramos de nueces. Quieren dividirlos en porciones iguales lo más grandes posible. ¿De cuántos gramos será cada porción?",
    "opciones": {
      "A": "15 gramos",
      "B": "25 gramos",
      "C": "10 gramos"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 20,
    "pregunta": "Diego tiene un cable de 12 metros y otro de 20 metros. Necesita cortarlos en pedazos del mismo tamaño y lo más largos posible. ¿Cuánto medirá cada pedazo?",
    "opciones": {
      "A": "6 metros",
      "B": "2 metros",
      "C": "4 metros"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 21,
    "pregunta": "Se prepararon 16 sándwiches de queso y 20 de jamón. Se quieren colocar en bandejas idénticas sin que sobre nada. ¿Cuál es el mayor número de bandejas que se pueden usar?",
    "opciones": {
      "A": "4 bandejas",
      "B": "8 bandejas",
      "C": "2 bandejas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 22,
    "pregunta": "En una caja hay 15 gomas de borrar y 25 clips. Si queremos armar paquetitos iguales con el mayor número de artículos sin que sobre nada, ¿cuántos paquetitos armaremos?",
    "opciones": {
      "A": "5 paquetitos",
      "B": "3 paquetitos",
      "C": "15 paquetitos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 23,
    "pregunta": "Un frutero tiene 21 limones y 28 naranjas. Quiere preparar cestas idénticas para vender. ¿Cuál es el número máximo de cestas que puede armar sin que sobre fruta?",
    "opciones": {
      "A": "3 cestas",
      "B": "7 cestas",
      "C": "14 cestas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 24,
    "pregunta": "En una feria hay 30 globos rojos y 40 globos amarillos. Se quieren armar racimos idénticos de globos. ¿Cuál es la mayor cantidad de racimos que se pueden hacer?",
    "opciones": {
      "A": "10 racimos",
      "B": "5 racimos",
      "C": "20 racimos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 25,
    "pregunta": "Tenemos 24 caramelos de fresa y 40 de menta. Queremos rellenar piñatas de forma idéntica sin que sobre nada. ¿Cuál es el máximo número de piñatas que podemos rellenar?",
    "opciones": {
      "A": "4 piñatas",
      "B": "6 piñatas",
      "C": "8 piñatas"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 26,
    "pregunta": "María tiene 18 metros de tela roja y 30 metros de tela verde. Para hacer disfraces, necesita cortar ambas telas en tiras del mismo tamaño y lo más largas posible. ¿De cuántos metros será cada tira?",
    "opciones": {
      "A": "3 metros",
      "B": "6 metros",
      "C": "9 metros"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 27,
    "pregunta": "Un coleccionista tiene 27 monedas de oro y 36 de plata. Quiere guardarlas en estuches idénticos. ¿Cuál es el mayor número de estuches que necesitará?",
    "opciones": {
      "A": "9 estuches",
      "B": "3 estuches",
      "C": "12 estuches"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 28,
    "pregunta": "Una costurera tiene 14 botones grandes y 35 pequeños. Quiere coserlos en camisas idénticas usando todos los botones. ¿Cuántas camisas como máximo puede adornar?",
    "opciones": {
      "A": "2 camisas",
      "B": "7 camisas",
      "C": "5 camisas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 29,
    "pregunta": "En un videojuego recolectaste 16 gemas rojas y 40 gemas azules. Si el juego te pide hacer cofres idénticos de recompensa, ¿cuántos cofres como máximo puedes crear?",
    "opciones": {
      "A": "4 cofres",
      "B": "8 cofres",
      "C": "16 cofres"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 30,
    "pregunta": "Tenemos 20 fotos en blanco y negro y 50 a color. Queremos pegarlas en un álbum de modo que cada página tenga exactamente la misma cantidad de fotos. ¿Cuál es el máximo de páginas que podemos llenar?",
    "opciones": {
      "A": "5 páginas",
      "B": "20 páginas",
      "C": "10 páginas"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 31,
    "pregunta": "En la cafetería tienen 24 fresas y 60 moras. Quieren preparar vasos de fruta idénticos sin que sobre ninguna. ¿Cuántos vasos iguales podrán hacer como máximo?",
    "opciones": {
      "A": "12 vasos",
      "B": "6 vasos",
      "C": "24 vasos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 32,
    "pregunta": "Un mecánico tiene 32 tornillos y 48 tuercas. Quiere armar kits de herramientas idénticos para sus ayudantes. ¿Cuál es el mayor número de kits que puede armar?",
    "opciones": {
      "A": "8 kits",
      "B": "16 kits",
      "C": "4 kits"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 33,
    "pregunta": "Una artesana tiene 35 hilos de lana y 45 de algodón. Quiere armar telares idénticos. ¿Cuál es la mayor cantidad de telares que puede armar sin que sobre hilo?",
    "opciones": {
      "A": "7 telares",
      "B": "9 telares",
      "C": "5 telares"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 34,
    "pregunta": "Tomás tiene 40 tarjetas de superhéroes y 56 de villanos. Las quiere guardar en carpetas idénticas. ¿Cuál es el número máximo de carpetas que puede usar?",
    "opciones": {
      "A": "8 carpetas",
      "B": "4 carpetas",
      "C": "12 carpetas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 35,
    "pregunta": "Un arquitecto de Lego tiene 36 piezas cuadradas y 54 rectangulares. Quiere construir casitas idénticas con la mayor cantidad de piezas. ¿Cuántas casitas puede armar?",
    "opciones": {
      "A": "9 casitas",
      "B": "18 casitas",
      "C": "12 casitas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 36,
    "pregunta": "En un vivero hay 42 cactus y 63 suculentas. Quieren hacer arreglos florales idénticos para vender. ¿Cuántos arreglos como máximo pueden hacer?",
    "opciones": {
      "A": "21 arreglos",
      "B": "7 arreglos",
      "C": "14 arreglos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 37,
    "pregunta": "Un profesor tiene 48 hojas blancas y 72 de colores. Quiere hacer libretas idénticas para sus alumnos. ¿Cuál es la mayor cantidad de libretas que puede armar?",
    "opciones": {
      "A": "12 libretas",
      "B": "24 libretas",
      "C": "8 libretas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 38,
    "pregunta": "En la frutería hay 12 manzanas, 18 peras y 24 plátanos. Quieren armar canastas frutales idénticas usando todas las frutas. ¿Cuántas canastas como máximo pueden armar?",
    "opciones": {
      "A": "6 canastas",
      "B": "3 canastas",
      "C": "4 canastas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 39,
    "pregunta": "Para Halloween tenemos 20 chocolates, 30 paletas y 40 chicles. Queremos armar bolsitas sorpresa idénticas para los niños. ¿Cuántas bolsitas iguales podemos hacer al máximo?",
    "opciones": {
      "A": "5 bolsitas",
      "B": "10 bolsitas",
      "C": "20 bolsitas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 40,
    "pregunta": "Tenemos 16 libros de cuentos, 24 de ciencia y 32 de arte. Queremos donarlos en cajas idénticas a diferentes bibliotecas. ¿Cuántas cajas iguales armaremos?",
    "opciones": {
      "A": "8 cajas",
      "B": "4 cajas",
      "C": "12 cajas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 41,
    "pregunta": "Un artista tiene 15 pinceles, 30 crayones y 45 marcadores. Quiere hacer estuches de dibujo idénticos. ¿Cuál es el mayor número de estuches que puede hacer?",
    "opciones": {
      "A": "5 estuches",
      "B": "10 estuches",
      "C": "15 estuches"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 42,
    "pregunta": "En un concurso hay 18 premios dorados, 27 plateados y 36 de bronce. Quieren armar paquetes de premios idénticos. ¿Cuántos paquetes como máximo se pueden hacer?",
    "opciones": {
      "A": "6 paquetes",
      "B": "9 paquetes",
      "C": "3 paquetes"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 43,
    "pregunta": "En el baúl hay 24 muñecos, 36 carritos y 48 pelotas. Se quieren repartir en cajas idénticas para un orfanato. ¿Cuál es el máximo de cajas que se pueden armar?",
    "opciones": {
      "A": "12 cajas",
      "B": "6 cajas",
      "C": "24 cajas"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 44,
    "pregunta": "Una niña ahorró 10 monedas de un peso, 20 de dos pesos y 25 de cinco pesos. Quiere meterlas en alcancías para sus hermanos de forma idéntica. ¿A cuántos hermanos les puede regalar una alcancía?",
    "opciones": {
      "A": "10 hermanos",
      "B": "2 hermanos",
      "C": "5 hermanos"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 45,
    "pregunta": "Para decorar, hay 14 globos azules, 21 verdes y 28 blancos. Quieren armar arreglos de globos idénticos. ¿Cuál es la mayor cantidad de arreglos que pueden armar?",
    "opciones": {
      "A": "7 arreglos",
      "B": "14 arreglos",
      "C": "3 arreglos"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 46,
    "pregunta": "En una joyería tienen 12 diamantes, 16 esmeraldas y 20 rubíes. Quieren fabricar collares idénticos sin que sobre ninguna piedra. ¿Cuántos collares pueden hacer?",
    "opciones": {
      "A": "2 collares",
      "B": "4 collares",
      "C": "6 collares"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 47,
    "pregunta": "Para un taller de robótica hay 30 motores, 40 ruedas y 50 sensores. Se quieren armar kits idénticos para cada alumno. ¿A cuántos alumnos como máximo les tocará un kit?",
    "opciones": {
      "A": "5 alumnos",
      "B": "20 alumnos",
      "C": "10 alumnos"
    },
    "respuesta_correcta": "C",
    "tema": "máximo común divisor"
  },
  {
    "id": 48,
    "pregunta": "En un jardín florecieron 8 margaritas, 12 claveles y 16 girasoles. El jardinero quiere hacer jarrones idénticos con ellas. ¿Cuántos jarrones iguales puede armar como máximo sin que sobre ninguna flor?",
    "opciones": {
      "A": "4 jarrones",
      "B": "2 jarrones",
      "C": "6 jarrones"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  },
  {
    "id": 49,
    "pregunta": "Un frutero tiene 24 mandarinas, 36 ciruelas y 48 duraznos. Quiere repartirlos en bolsas idénticas con la mayor cantidad de fruta posible sin que sobre nada. ¿Cuántas bolsas como máximo puede armar?",
    "opciones": {
      "A": "6 bolsas",
      "B": "12 bolsas",
      "C": "8 bolsas"
    },
    "respuesta_correcta": "B",
    "tema": "máximo común divisor"
  },
  {
    "id": 50,
    "pregunta": "En un club deportivo hay 18 balones de fútbol, 30 de baloncesto y 42 de voleibol. El entrenador quiere guardarlos en contenedores idénticos de manera que contengan la misma cantidad de cada tipo sin que sobre ninguno. ¿Cuál es el mayor número de contenedores que puede armar?",
    "opciones": {
      "A": "6 contenedores",
      "B": "3 contenedores",
      "C": "10 contenedores"
    },
    "respuesta_correcta": "A",
    "tema": "máximo común divisor"
  }
]

try:
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="logicakids_local",
        user="logicakids_local_user",
        password="LogicaKids2026#Local"
    )
    conn.autocommit = False
    cur = conn.cursor()
    
    # --- MIGRACION MCM (Sección de desafíos 5012) ---
    print("Iniciando migración MCM en sección 5012...")
    cur.execute("SELECT id FROM preguntas WHERE fase_id = 3 AND seccion = 5012")
    mcm_q_ids = [row[0] for row in cur.fetchall()]
    
    if len(mcm_q_ids) < 50:
        raise Exception(f"No hay suficientes preguntas de desafíos MCM para sustituir (se encontraron {len(mcm_q_ids)}, se requieren 50)")
        
    random.seed(42)  # semilla fija para reproductibilidad
    mcm_to_delete = random.sample(mcm_q_ids, 50)
    print(f"Preguntas MCM seleccionadas para eliminar: {mcm_to_delete}")
    
    # Eliminar alternativas y preguntas
    cur.execute("DELETE FROM alternativas WHERE pregunta_id IN %s", (tuple(mcm_to_delete),))
    cur.execute("DELETE FROM preguntas WHERE id IN %s", (tuple(mcm_to_delete),))
    
    # Insertar las nuevas preguntas
    for q in questions_mcm:
        correct_letter = q["respuesta_correcta"]
        correct_text = q["opciones"][correct_letter]
        
        cur.execute("""
            INSERT INTO preguntas (
                fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, 
                datos_numericos, requiere_subrayado, estado, revisado_admin, creado_por, modificado_por
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            3, 5012, 'MIXTA', 'MULTIPLE_OPCION', q["pregunta"], correct_text,
            '{"es_desafio": true}', False, 'ACTIVO', False, None, None
        ))
        
        pregunta_id = cur.fetchone()[0]
        
        # Insertar alternativas
        options_order = ["A", "B", "C"]
        for idx, letter in enumerate(options_order):
            opt_text = q["opciones"][letter]
            is_correct = (letter == correct_letter)
            
            cur.execute("""
                INSERT INTO alternativas (
                    pregunta_id, texto, es_correcta, orden
                ) VALUES (%s, %s, %s, %s)
            """, (
                pregunta_id, opt_text, is_correct, idx + 1
            ))
            
    # --- MIGRACION MCD (Sección de desafíos 5013) ---
    print("Iniciando migración MCD en sección 5013...")
    cur.execute("SELECT id FROM preguntas WHERE fase_id = 3 AND seccion = 5013")
    mcd_q_ids = [row[0] for row in cur.fetchall()]
    
    if len(mcd_q_ids) < 50:
        raise Exception(f"No hay suficientes preguntas de desafíos MCD para sustituir (se encontraron {len(mcd_q_ids)}, se requieren 50)")
        
    mcd_to_delete = random.sample(mcd_q_ids, 50)
    print(f"Preguntas MCD seleccionadas para eliminar: {mcd_to_delete}")
    
    # Eliminar alternativas y preguntas
    cur.execute("DELETE FROM alternativas WHERE pregunta_id IN %s", (tuple(mcd_to_delete),))
    cur.execute("DELETE FROM preguntas WHERE id IN %s", (tuple(mcd_to_delete),))
    
    # Insertar las nuevas preguntas
    for q in questions_mcd:
        correct_letter = q["respuesta_correcta"]
        correct_text = q["opciones"][correct_letter]
        
        cur.execute("""
            INSERT INTO preguntas (
                fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, 
                datos_numericos, requiere_subrayado, estado, revisado_admin, creado_por, modificado_por
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            3, 5013, 'MIXTA', 'MULTIPLE_OPCION', q["pregunta"], correct_text,
            '{"es_desafio": true}', False, 'ACTIVO', False, None, None
        ))
        
        pregunta_id = cur.fetchone()[0]
        
        # Insertar alternativas
        options_order = ["A", "B", "C"]
        for idx, letter in enumerate(options_order):
            opt_text = q["opciones"][letter]
            is_correct = (letter == correct_letter)
            
            cur.execute("""
                INSERT INTO alternativas (
                    pregunta_id, texto, es_correcta, orden
                ) VALUES (%s, %s, %s, %s)
            """, (
                pregunta_id, opt_text, is_correct, idx + 1
            ))
            
    conn.commit()
    print("MIGRACION DE PREGUNTAS MCM Y MCD COMPLETADA CON EXITO!")
    
except Exception as e:
    print(f"Error durante la migración: {e}")
    if 'conn' in locals() and conn:
        conn.rollback()
finally:
    if 'conn' in locals() and conn:
        conn.close()

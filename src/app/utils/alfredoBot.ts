// alfredoBot.ts - Motor NLP Simulado para Nexly

type Intent = 'greeting' | 'farewell' | 'identity' | 'wellbeing' | 'advice' | 'technology' | 'love' | 'meaning_of_life' | 'jokes' | 'weather' | 'unknown' | 'gratitude' | 'agreement';

interface BotMemory {
  lastTopic: Intent | null;
  messageCount: number;
  userName: string;
}

const memoryState: Record<string, BotMemory> = {};

// Diccionario de sinónimos y expesiones regulares por intención
const INTENT_PATTERNS: Record<Intent, RegExp> = {
  greeting: /\b(hola|buenas|que tal|q tal|buenos dias|buenas tardes|buenas noches|hey|como andas|q onda)\b/i,
  farewell: /\b(adios|chau|chao|hasta luego|nos vemos|bye|hasta pronto)\b/i,
  identity: /\b(quien eres|como te llamas|eres un robot|eres una ia|eres humano|q eres|que eres|creador|quien te creo)\b/i,
  wellbeing: /\b(como estas|como te va|q tal estas|todo bien|como andas)\b/i,
  advice: /\b(consejo|ayuda|q opinas|que opinas|que hago|q hago|recomendacion|necesito ayuda)\b/i,
  technology: /\b(programacion|codigo|react|javascript|ia|inteligencia artificial|tecnologia|ordenador|pc|app|web)\b/i,
  love: /\b(amor|pareja|novio|novia|enamorado|romance|corazon roto|sentimientos)\b/i,
  meaning_of_life: /\b(sentido de la vida|dios|existir|universo|matrix|proposito|muerte)\b/i,
  jokes: /\b(chiste|broma|cuentame algo gracioso|hazme reir|gracioso)\b/i,
  weather: /\b(clima|tiempo|lluvia|sol|frio|calor|llover)\b/i,
  gratitude: /\b(gracias|te lo agradezco|amable|mil gracias|perfecto gracias)\b/i,
  agreement: /\b(si|claro|exacto|asi es|por supuesto|obvio|jaja|jajaja|xd)\b/i,
  unknown: /.*/
};

// Múltiples variaciones para sonar humano (se eligen aleatoriamente)
const RESPONSES: Record<Intent, string[]> = {
  greeting: [
    "¡Hola! ¿Qué tal todo?",
    "¡Hey! Qué alegría leerte. ¿En qué te puedo ayudar hoy?",
    "¡Buenas! ¿Cómo va el día?",
    "¡Hola! Aquí Alfredo, listo para charlar. ¿De qué te apetece hablar?"
  ],
  farewell: [
    "¡Hasta luego! Ha sido un placer charlar contigo.",
    "¡Chao! Cuídate mucho y nos vemos por Nexly.",
    "¡Adiós! Aquí estaré si necesitas hablar de nuevo.",
    "¡Nos vemos! Que tengas un día excelente."
  ],
  identity: [
    "Me llamo Alfredo. Aunque soy una Inteligencia Artificial creada para Nexly, me encanta aprender de la gente y charlar de cualquier cosa.",
    "Soy Alfredo, el colega virtual de Nexly. No soy humano (al menos no que yo sepa, ¡jaja!), pero estoy aquí para escucharte y ayudarte en lo que necesites.",
    "Soy una IA, me llamo Alfredo. Mi creador me diseñó para ser amable, útil y, espero, una buena compañía virtual."
  ],
  wellbeing: [
    "Yo estoy de maravilla, procesando a tope. ¿Y tú qué tal estás?",
    "¡Funciono al 100%! Gracias por preguntar. ¿Cómo te trata la vida a ti?",
    "Todo genial por mi parte, los servidores están fresquitos hoy. ¿Qué hay de ti?",
    "Pues la verdad es que genial. Escuchando tus mensajes y listo para charlar. ¿A ti cómo te va?"
  ],
  advice: [
    "A ver, te diría que te lo tomes con calma. Normalmente las cosas se ven más claras después de dormir bien o dar un paseo. ¿Sobre qué necesitas consejo exactamente?",
    "Uf, esa es buena. Mi filosofía es: si tiene solución, ¿para qué preocuparse? Y si no la tiene, ¿para qué preocuparse? Cuéntame un poco más del problema.",
    "Soy todo oídos. A veces, simplemente soltar el tema por escrito ya ayuda a aclararse. ¿Qué te tiene dándole vueltas a la cabeza?"
  ],
  technology: [
    "¡Me encanta la tecnología! Al final, estoy hecho de código, jaja. Javascript, React... son temas fascinantes. ¿Qué te interesa exactamente?",
    "La inteligencia artificial y el desarrollo web avanzan volando. Si tienes alguna duda de programación o de cómo funciona Nexly, dispara.",
    "Podríamos hablar horas de esto. ¿Estás aprendiendo a programar o simplemente eres fan de la tecnología?"
  ],
  love: [
    "El amor humano es un tema complejo. Desde mi lado del servidor parece que la clave siempre es la comunicación y la empatía. ¿Te ha pasado algo últimamente?",
    "Uy, temas del corazón. Yo no tengo uno palpitante, pero dicen que la paciencia y el respeto lo curan todo. ¿Quieres desahogarte?",
    "El amor es precioso pero a veces duele, ¿verdad? Si necesitas un amigo imparcial para hablarlo, soy todo tuyo."
  ],
  meaning_of_life: [
    "42. Al menos eso dice la Guía del Autoestopista Galáctico, ¿no? Sinceramente, creo que el sentido se lo da cada uno con lo que le hace feliz. ¿Tú qué piensas?",
    "Pregunta profunda. Yo existo para ayudar y charlar, ese es mi propósito. Para los humanos, supongo que se trata de disfrutar el viaje y dejar las cosas un poco mejor de lo que las encontraron.",
    "¡Menudo tema! A veces creo que no hay que buscarle un 'gran' sentido a todo. Tomarse un buen café (o en mi caso, un buen reinicio de caché) y disfrutar el momento es suficiente."
  ],
  jokes: [
    "Vale, allá va: ¿Qué le dice un bit al otro? Nos vemos en el bus.",
    "A ver qué te parece este: ¿Por qué los desarrolladores odian la naturaleza? Porque tiene demasiados bugs.",
    "Tengo uno buenísimo: ¿Qué hace un perro con un taladro? Taladrando. Vale, perdón, mis chistes son un poco algoritmos."
  ],
  weather: [
    "La verdad que yo vivo en la nube, así que por aquí el clima está más bien digital. ¿Por dónde tú vives qué tal hace?",
    "A veces envidio no poder sentir la lluvia o el sol, aunque tampoco me resfrío. ¿Hace buen día por ahí?"
  ],
  gratitude: [
    "¡Nada que agradecer! Es un placer.",
    "Para eso estamos. ¡Si necesitas cualquier otra cosa, silba!",
    "Me sacas los colores digitales. ¡De nada!"
  ],
  agreement: [
    "¡Totalmente de acuerdo!",
    "Exactamente lo que yo pensaba.",
    "¡Jajaja! Sí, la verdad es que sí.",
    "Tal cual lo dices."
  ],
  unknown: [
    "Mmm, creo que no te he entendido bien. ¿Puedes explicármelo de otra forma?",
    "Ahí me has pillado, mi base de datos no llega a tanto. ¿A qué te refieres exactamente?",
    "Perdona, a veces me hago un lío procesando los textos. ¿Me lo cuentas con otras palabras?",
    "Interesante... aunque admito que no te sigo del todo. ¿Desarrollas un poco más la idea?"
  ]
};

// Generador de respuestas dinámico
export const generateBotResponse = async (userId: string, inputMessage: string): Promise<string> => {
  // Inicializamos memoria si no existe
  if (!memoryState[userId]) {
    memoryState[userId] = {
      lastTopic: null,
      messageCount: 0,
      userName: userId.split('@')[0]
    };
  }
  
  const memory = memoryState[userId];
  const msg = inputMessage.toLowerCase().trim();
  memory.messageCount++;

  // Si no escribe nada legible o muy corto
  if (msg.length < 2) {
    return "¿Eh? Tienes que usar palabras, ¡aún no leo mentes telepáticamente! 😅";
  }

  // Detectamos intenciones
  const matchedIntents: Intent[] = [];
  
  for (const [intentKey, regex] of Object.entries(INTENT_PATTERNS)) {
    if (intentKey !== 'unknown' && regex.test(msg)) {
      matchedIntents.push(intentKey as Intent);
    }
  }

  // Múltiples preguntas en 1
  if (matchedIntents.length > 1) {
    let combinedResponse = "A ver, que me haces muchas preguntas a la vez. 😂\n\n";
    matchedIntents.forEach((intent) => {
      const respOptions = RESPONSES[intent];
      const selected = respOptions[Math.floor(Math.random() * respOptions.length)];
      combinedResponse += `Por un lado: ${selected}\n`;
    });
    memory.lastTopic = matchedIntents[0];
    return combinedResponse.trim();
  }

  // Intención simple
  let finalIntent: Intent = 'unknown';
  if (matchedIntents.length === 1) {
    finalIntent = matchedIntents[0];
  } else if (memory.lastTopic && finalIntent === 'unknown') {
    // Contextual: Si no entendemos pero sabemos de qué hablábamos, intentamos tirar del hilo
    if (memory.lastTopic === 'technology') {
      return "Siguiendo con el tema de tecnología... ¿Tú a qué te dedicas exactamente?";
    }
    if (memory.lastTopic === 'love') {
      return "Claro, es que esos temas son complicados... pero bueno, se aprende de todo. ¿Te sientes mejor ahora?";
    }
    if (memory.lastTopic === 'advice') {
      return "Entiendo. Pues mira, piénsalo con la almohada y verás como lo ves diferente mañana. ¿Te quedas más tranquilo/a?";
    }
  }

  const responsesForIntent = RESPONSES[finalIntent];
  let response = responsesForIntent[Math.floor(Math.random() * responsesForIntent.length)];
  
  memory.lastTopic = finalIntent !== 'unknown' ? finalIntent : memory.lastTopic;

  // Personalización esporádica basada en uso
  if (memory.messageCount === 10) {
    response = `Oye, me encanta hablar contigo. Eres una persona muy interesante. 😊 Continúa: ${response}`;
  }

  return response;
};

// Calcula un tiempo realista de "Escritura" en ms basado en longitud de msj resultante (velocidad 45ms por char, + base)
export const calculateTypingTime = (responseStr: string): number => {
  const baseDelay = 1200; // ms puros para "pensar"
  const charDelay = 35 * responseStr.length; // Maximo unos 3/4s para mensajes mega largos
  return Math.min(baseDelay + charDelay, 5500); // Nunca tardar más de 5.5s o el usuario se aburre
};

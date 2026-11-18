// Прогрессии к статическим элементам калистеники.
// Источники:
// - Overcoming Gravity (Steven Low) — золотой стандарт прогрессий
// - Building the Gymnastic Body (Christopher Sommer)
// - Convict Conditioning (Paul Wade) — философия постепенности
// - GZCL-method, GMB Fitness, Yuri Marmerstein
//
// Гейт-критерий: 20 секунд удержания с чистой техникой (по опыту пользователя).
// Это значение — надёжный порог перехода на следующий уровень.

import type { StaticElement } from "@/lib/types";

export const STATIC_ELEMENTS: Omit<StaticElement, "id">[] = [
  // ============================================================
  // 1. ГОРИЗОНТ (PLANCHE)
  // ============================================================
  {
    slug: "planche",
    nameRu: "Горизонт",
    nameEn: "Planche",
    descriptionRu:
      "Удержание горизонтального положения тела параллельно земле с опорой только на руки. Элитный элемент гимнастики, требующий огромной силы передней дельты, бицепса плеча и кора. В калистенике — символ мастерства.",
    descriptionEn:
      "Holding the body horizontal and parallel to the ground supported only on hands. Elite gymnastics element requiring immense anterior deltoid, biceps and core strength. In calisthenics, a symbol of mastery.",
    icon: "Planche",
    steps: [
      {
        order: 1,
        slug: "pushup-pseudo-planche",
        nameRu: "Псевдо-планш (отжимания)",
        nameEn: "Pseudo planche push-ups",
        descriptionRu:
          "Отжимания со смещением центра тяжести вперёд. Руки у бёдер, корпус наклонён вперёд. Подводящее упражнение: нагружает переднюю дельту в динамике.",
        descriptionEn:
          "Push-ups with center of gravity shifted forward. Hands at hips, body leaning forward. Progression exercise: loads anterior deltoid dynamically.",
        gateSec: 0,
        gateReps: 15,
        gateNotesRu:
          "15 чистых повторений с наклоном корпуса вперёд, локти прижаты, без прогиба в пояснице.",
        gateNotesEn:
          "15 clean reps with forward lean, elbows tucked, no lower back arch.",
        trainingRu:
          "3-4 подхода по 8-12 повторений, 2-3 раза в неделю. Отдых 2-3 минуты между подходами.",
        trainingEn:
          "3-4 sets of 8-12 reps, 2-3 times per week. Rest 2-3 minutes between sets.",
        assistanceExercises: [
          "pushup-classic",
          "pushup-pike",
          "pushup-diamond",
        ],
        sources: ["Overcoming Gravity, Chapter 9", "GMB Fitness"],
      },
      {
        order: 2,
        slug: "planche-tuck",
        nameRu: "Tucked горизонт (колени к груди)",
        nameEn: "Tucked planche",
        descriptionRu:
          "Удержание с коленями, прижатыми к груди. Плечи наклонены вперёд, руки прямые. Первый шаг к статике горизонта.",
        descriptionEn:
          "Hold with knees tucked to chest. Shoulders leaned forward, arms straight. First step toward planche static.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд с прямыми руками, локти заблокированы, колени прижаты к груди, спина круглая (не прогнутая). Таз на уровне плеч.",
        gateNotesEn:
          "20 seconds with straight arms, elbows locked, knees to chest, back rounded (not arched). Hips at shoulder level.",
        trainingRu:
          "5 подходов по 10-15 секунд с отдыхом 90 секунд. Частота: 3 раза в неделю. После 20-секундного удержания переходи к adv tuck.",
        trainingEn:
          "5 sets of 10-15 seconds with 90 seconds rest. Frequency: 3 times per week. After 20-second hold, advance to adv tuck.",
        assistanceExercises: [
          "pushup-pseudo-planche",
          "planche-adv-tuck",
          "lsit-floor",
        ],
        sources: ["Overcoming Gravity, Chapter 10", "Sommer, Building the Gymnastic Body"],
      },
      {
        order: 3,
        slug: "planche-adv-tuck",
        nameRu: "Advanced tucked горизонт (спина прямая)",
        nameEn: "Advanced tucked planche",
        descriptionRu:
          "Из tucked — выпрями спину, оставив колени согнутыми. Линия спины прямая, таз на уровне плеч. Значительно сложнее: та же нагрузка, но без «круглой» спины, давящей на кор.",
        descriptionEn:
          "From tucked — straighten back keeping knees bent. Back line straight, hips at shoulder level. Significantly harder: same load but without rounded back supporting the core.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд с прямой спиной (без прогиба), колени согнуты под 90°, таз на уровне плеч, руки прямые, локти заблокированы.",
        gateNotesEn:
          "20 seconds with straight back (no arch), knees at 90°, hips at shoulder level, arms straight, elbows locked.",
        trainingRu:
          "5 подходов по 8-12 секунд, отдых 2 минуты. 3-4 раза в неделю. Это самое сложное «переходное» удержание — не торопись переходить к straddle.",
        trainingEn:
          "5 sets of 8-12 seconds, 2 minutes rest. 3-4 times per week. This is the hardest «transition» hold — don't rush to straddle.",
        assistanceExercises: ["planche-tuck", "pushup-pseudo-planche", "hollow-hold"],
        sources: ["Overcoming Gravity, Chapter 10", "Sommer, Floor planche progressions"],
      },
      {
        order: 4,
        slug: "planche-straddle",
        nameRu: "Straddle горизонт (ноги врозь)",
        nameEn: "Straddle planche",
        descriptionRu:
          "Удержание с ногами, разведёнными в стороны. Уменьшает рычаг за счёт разведения центра тяжести. Заключительный шаг перед full.",
        descriptionEn:
          "Hold with legs spread apart. Reduces lever by spreading center of gravity. Final step before full.",
        gateSec: 15,
        gateNotesRu:
          "15 секунд с прямыми ногами врозь (угол ~60°), спина прямая, таз на уровне плеч, руки прямые. Полная фиксация без заваливания бёдер.",
        gateNotesEn:
          "15 seconds with straight legs apart (~60° angle), back straight, hips at shoulder level, arms straight. Full hold without hips dropping.",
        trainingRu:
          "5 подходов по 5-10 секунд. 3 раза в неделю. Обязательно — видео-самоконтроль: таз не должен проваливаться ниже плеч.",
        trainingEn:
          "5 sets of 5-10 seconds. 3 times per week. Mandatory video self-check: hips must not drop below shoulders.",
        assistanceExercises: ["planche-adv-tuck", "planche-tuck", "pushup-pseudo-planche"],
        sources: ["Overcoming Gravity, Chapter 11", "Andrei Minin tutorials"],
      },
      {
        order: 5,
        slug: "planche-full",
        nameRu: "Full горизонт (полный)",
        nameEn: "Full planche",
        descriptionRu:
          "Полный горизонт с сомкнутыми прямыми ногами. Элитный элемент — требуют огромной относительной силы и многолетней подготовки.",
        descriptionEn:
          "Full planche with straight legs together. Elite element requiring immense relative strength and years of preparation.",
        gateSec: 5,
        gateNotesRu:
          "5 секунд с полностью прямыми ногами вместе, тело параллельно земле, локти заблокированы, без проваливания таза.",
        gateNotesEn:
          "5 seconds with fully straight legs together, body parallel to ground, elbows locked, no hip drop.",
        trainingRu:
          "Работа с тренером или видео. 3-5 подходов по 2-5 секунд. Это пиковый элемент — нужен год+ подготовки.",
        trainingEn:
          "Work with coach or video. 3-5 sets of 2-5 seconds. This is a peak element — needs year+ of prep.",
        assistanceExercises: ["planche-straddle", "planche-adv-tuck", "hspu-wall"],
        sources: ["Overcoming Gravity, Chapter 11", "Elite gymnastics literature"],
      },
    ],
  },

  // ============================================================
  // 2. ПЕРЕДНИЙ ВИС (FRONT LEVER)
  // ============================================================
  {
    slug: "front-lever",
    nameRu: "Передний вис",
    nameEn: "Front lever",
    descriptionRu:
      "Удержание горизонтального положения тела лицом вверх, вися на перекладине. Активирует широчайшие, трапецию, ромбовидные, заднюю дельту и кор. Один из самых эстетичных элементов калистеники.",
    descriptionEn:
      "Holding body horizontal face-up, hanging from a bar. Activates lats, traps, rhomboids, posterior deltoid and core. One of the most aesthetic calisthenics elements.",
    icon: "FrontLever",
    steps: [
      {
        order: 1,
        slug: "pullup-australian",
        nameRu: "Австралийские подтягивания (горизонтальная тяга)",
        nameEn: "Australian pull-ups (bodyweight rows)",
        descriptionRu:
          "Горизонтальные подтягивания на низкой перекладине. Базовая горизонтальная тяга, подготавливающая широчайшие к переднему вису.",
        descriptionEn:
          "Horizontal pull-ups on a low bar. Basic horizontal pull, preparing lats for front lever.",
        gateSec: 0,
        gateReps: 15,
        gateNotesRu:
          "15 чистых повторений с телом в одну линию, грудь касается перекладины, лопатки сведены.",
        gateNotesEn:
          "15 clean reps with body in straight line, chest touches bar, shoulder blades squeezed.",
        trainingRu:
          "3-4 подхода по 10-12 повторений, 2-3 раза в неделю. Постепенно опускай перекладину ниже (увеличивая угол тела).",
        trainingEn:
          "3-4 sets of 10-12 reps, 2-3 times per week. Gradually lower the bar (increasing body angle).",
        assistanceExercises: ["pullup-classic", "pullup-chin"],
        sources: ["Overcoming Gravity, Front lever progressions"],
      },
      {
        order: 2,
        slug: "pullup-gironda",
        nameRu: "Подтягивания Жиронды",
        nameEn: "Gironda sternum pull-ups",
        descriptionRu:
          "Подтягивания с касанием перекладины грудиной. Переносят фокус с вертикального на горизонтальный тяговый вектор — идеальное подводящее к переднему вису. K_diff = 1.6-1.8 к классике.",
        descriptionEn:
          "Pull-ups touching the bar with sternum. Shifts focus from vertical to horizontal pull vector — ideal front lever progression. K_diff = 1.6-1.8 vs classic.",
        gateSec: 0,
        gateReps: 10,
        gateNotesRu:
          "10 чистых повторений с касанием грудиной, тело под 45°, без раскачки. Пауза 1 сек в верхней точке.",
        gateNotesEn:
          "10 clean reps touching sternum, body at 45°, no swinging. 1 sec pause at top.",
        trainingRu:
          "3-4 подхода по 6-8 повторений. 2-3 раза в неделю. Обязательно — «правило 3 секунд» в верхней точке (см. техники).",
        trainingEn:
          "3-4 sets of 6-8 reps. 2-3 times per week. Mandatory — «3-second rule» at top (see techniques).",
        assistanceExercises: ["pullup-australian", "pullup-gironda-hold", "pullup-classic"],
        sources: ["Vince Gironda technique", "EMG studies on lat activation"],
      },
      {
        order: 3,
        slug: "front-lever-tuck",
        nameRu: "Tucked передний вис (колени к груди)",
        nameEn: "Tucked front lever",
        descriptionRu:
          "Удержание горизонтального положения с коленями, прижатыми к груди. Первый шаг к статике переднего виса.",
        descriptionEn:
          "Horizontal hold with knees tucked to chest. First step toward front lever static.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд с коленями к груди, спина прямая (не проваливается), руки прямые, тело горизонтально.",
        gateNotesEn:
          "20 seconds with knees to chest, back straight (not sagging), arms straight, body horizontal.",
        trainingRu:
          "5 подходов по 10-15 секунд, отдых 90 секунд. 3 раза в неделю. Не сгибай руки — это чит.",
        trainingEn:
          "5 sets of 10-15 seconds, 90 seconds rest. 3 times per week. Don't bend arms — that's cheating.",
        assistanceExercises: ["pullup-gironda", "pullup-gironda-hold", "pullup-classic"],
        sources: ["Overcoming Gravity, Front lever chapter"],
      },
      {
        order: 4,
        slug: "front-lever-adv-tuck",
        nameRu: "Advanced tucked передний вис (спина прямая)",
        nameEn: "Advanced tucked front lever",
        descriptionRu:
          "Из tucked — выпрями спину, оставив колени согнутыми. Линия спины прямая. Усложняет за счёт увеличения рычага.",
        descriptionEn:
          "From tucked — straighten back keeping knees bent. Back line straight. Harder due to increased lever.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд с прямой спиной, колени согнуты под 90°, тело горизонтально, руки прямые, лопатки зафиксированы.",
        gateNotesEn:
          "20 seconds with straight back, knees at 90°, body horizontal, arms straight, shoulder blades locked.",
        trainingRu:
          "5 подходов по 8-12 секунд. 3-4 раза в неделю. Это самое сложное переходное удержание.",
        trainingEn:
          "5 sets of 8-12 seconds. 3-4 times per week. This is the hardest transition hold.",
        assistanceExercises: ["front-lever-tuck", "pullup-gironda-hold", "pullup-gironda"],
        sources: ["Overcoming Gravity, FL progressions", "Sommer, Building the Gymnastic Body"],
      },
      {
        order: 5,
        slug: "front-lever-full",
        nameRu: "Full передний вис (полный)",
        nameEn: "Full front lever",
        descriptionRu:
          "Полный передний вис с прямыми ногами вместе. Элитный элемент, требует огромной относительной силы широчайших.",
        descriptionEn:
          "Full front lever with straight legs together. Elite element, requires immense lat relative strength.",
        gateSec: 5,
        gateNotesRu:
          "5 секунд с полностью прямыми ногами вместе, тело в идеальной горизонтали, без провисания бёдер.",
        gateNotesEn:
          "5 seconds with fully straight legs together, body in perfect horizontal, no hip sag.",
        trainingRu:
          "3-5 подходов по 2-5 секунд. Нужен год+ подготовки. Straddle (ноги врозь) как переходный шаг.",
        trainingEn:
          "3-5 sets of 2-5 seconds. Year+ of prep needed. Straddle (legs apart) as transition step.",
        assistanceExercises: ["front-lever-adv-tuck", "front-lever-tuck", "pullup-gironda-hold"],
        sources: ["Overcoming Gravity", "Elite gymnastics literature"],
      },
    ],
  },

  // ============================================================
  // 3. L-СИТ → V-СИТ
  // ============================================================
  {
    slug: "l-sit",
    nameRu: "L-сит → V-сит",
    nameEn: "L-sit → V-sit",
    descriptionRu:
      "Удержание угла 90° (L-сит) и затем угла 45° (V-сит) с прямыми ногами на полу или паралетсах. Развивает кор, сгибатели бедра и трицепс. Фундаментальная позиция гимнастики.",
    descriptionEn:
      "Holding 90° angle (L-sit) and then 45° angle (V-sit) with straight legs on floor or parallettes. Develops core, hip flexors and triceps. Fundamental gymnastics position.",
    icon: "LSit",
    steps: [
      {
        order: 1,
        slug: "leg-raise",
        nameRu: "Подъём ног лёжа",
        nameEn: "Lying leg raises",
        descriptionRu:
          "Подъём прямых ног из положения лёжа. Базовая активация кора и сгибателей бедра.",
        descriptionEn:
          "Lying straight leg raises. Basic core and hip flexor activation.",
        gateSec: 0,
        gateReps: 20,
        gateNotesRu: "20 чистых повторений с прямыми ногами, поясница прижата к полу.",
        gateNotesEn: "20 clean reps with straight legs, lower back pressed to floor.",
        trainingRu: "3-4 подхода по 15 повторений. 2-3 раза в неделю.",
        trainingEn: "3-4 sets of 15 reps. 2-3 times per week.",
        assistanceExercises: ["crunch", "situp"],
        sources: ["Paul Wade, Convict Conditioning (leg raises progression)"],
      },
      {
        order: 2,
        slug: "hanging-leg-raise",
        nameRu: "Подъём ног в висе",
        nameEn: "Hanging leg raises",
        descriptionRu:
          "Подъём прямых ног в висе на перекладине до касания перекладины. Усложнённая версия — вся работа кора против гравитации.",
        descriptionEn:
          "Hanging straight leg raises to bar. Harder version — entire core working against gravity.",
        gateSec: 0,
        gateReps: 10,
        gateNotesRu: "10 чистых повторений с прямыми ногами, без раскачки, до касания перекладины.",
        gateNotesEn: "10 clean reps with straight legs, no swing, touching the bar.",
        trainingRu: "3-4 подхода по 6-8 повторений. 2-3 раза в неделю.",
        trainingEn: "3-4 sets of 6-8 reps. 2-3 times per week.",
        assistanceExercises: ["leg-raise", "pullup-classic"],
        sources: ["Convict Conditioning, Step 9-10", "Overcoming Gravity"],
      },
      {
        order: 3,
        slug: "lsit-floor",
        nameRu: "L-сит на полу",
        nameEn: "L-sit on floor",
        descriptionRu:
          "Удержание угла 90° с прямыми ногами, опора на руки. Спина прямая, ноги параллельны полу.",
        descriptionEn:
          "Holding 90° angle with straight legs, supported on hands. Back straight, legs parallel to floor.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд с прямыми ногами под углом 90°, спина прямая, руки заблокированы, локти прижаты.",
        gateNotesEn:
          "20 seconds with straight legs at 90°, back straight, arms locked, elbows tucked.",
        trainingRu:
          "5 подходов по 10-15 секунд. 3 раза в неделю. Если тяжело на полу — начни на паралетсах.",
        trainingEn:
          "5 sets of 10-15 seconds. 3 times per week. If too hard on floor — start on parallettes.",
        assistanceExercises: ["lsit-parallettes", "leg-raise", "hanging-leg-raise"],
        sources: ["Overcoming Gravity, L-sit chapter", "Sommer, Floor L-sit"],
      },
      {
        order: 4,
        slug: "lsit-parallettes",
        nameRu: "L-сит на паралетсах (продвинутый)",
        nameEn: "L-sit on parallettes (advanced)",
        descriptionRu:
          "L-сит с опорой на паралетсы — позволяет опустить таз ниже и увеличить амплитуду. Готовит к V-ситу.",
        descriptionEn:
          "L-sit on parallettes — allows hips to drop lower, increasing range. Prepares for V-sit.",
        gateSec: 30,
        gateNotesRu:
          "30 секунд на паралетсах с ногами под 90°, таз ниже уровня рук (вдавливание вниз).",
        gateNotesEn:
          "30 seconds on parallettes with legs at 90°, hips below hand level (pressing down).",
        trainingRu: "5 подходов по 20-25 секунд. 3-4 раза в неделю.",
        trainingEn: "5 sets of 20-25 seconds. 3-4 times per week.",
        assistanceExercises: ["lsit-floor", "hanging-leg-raise"],
        sources: ["Sommer, Building the Gymnastic Body"],
      },
      {
        order: 5,
        slug: "vsit",
        nameRu: "V-сит (уголок)",
        nameEn: "V-sit",
        descriptionRu:
          "Удержание угла 45° (ноги подняты выше горизонтали). Элитная версия L-сита. Требует экстремальной гибкости сгибателей бедра и силы кора.",
        descriptionEn:
          "Holding 45° angle (legs above horizontal). Elite version of L-sit. Requires extreme hip flexor flexibility and core strength.",
        gateSec: 10,
        gateNotesRu:
          "10 секунд с ногами выше горизонтали (угол ≤45° от вертикали), спина прямая, без заваливания назад.",
        gateNotesEn:
          "10 seconds with legs above horizontal (angle ≤45° from vertical), back straight, no backward lean.",
        trainingRu:
          "5 подходов по 5-8 секунд. 3 раза в неделю. Очень интенсивно для поясницы — следи за восстановлением.",
        trainingEn:
          "5 sets of 5-8 seconds. 3 times per week. Very intense for lower back — watch recovery.",
        assistanceExercises: ["lsit-parallettes", "lsit-floor"],
        sources: ["Overcoming Gravity, V-sit progression"],
      },
    ],
  },

  // ============================================================
  // 4. СТОЙКА НА РУКАХ (HANDSTAND)
  // ============================================================
  {
    slug: "handstand",
    nameRu: "Стойка на руках",
    nameEn: "Handstand",
    descriptionRu:
      "Удержание вертикального положения тела на руках. Развивает плечи, трицепс, кор и проприоцепцию. Фундамент для HSPU (отжиманий в стойке).",
    descriptionEn:
      "Holding vertical body position on hands. Develops shoulders, triceps, core and proprioception. Foundation for HSPU.",
    icon: "Handstand",
    steps: [
      {
        order: 1,
        slug: "pushup-pike",
        nameRu: "Pike отжимания (клюв)",
        nameEn: "Pike push-ups",
        descriptionRu:
          "Отжимания с тазом высоко, тело образует угол. Нагружает плечи в динамике — подводящее к стойке.",
        descriptionEn:
          "Push-ups with hips high, body forming an angle. Loads shoulders dynamically — handstand progression.",
        gateSec: 0,
        gateReps: 12,
        gateNotesRu:
          "12 чистых повторений с тазом высоко, голова между рук, касается пола перед собой.",
        gateNotesEn:
          "12 clean reps with hips high, head between arms, touching floor in front.",
        trainingRu: "3-4 подхода по 8-10 повторений. 2-3 раза в неделю.",
        trainingEn: "3-4 sets of 8-10 reps. 2-3 times per week.",
        assistanceExercises: ["pushup-classic", "pushup-pseudo-planche"],
        sources: ["Overcoming Gravity, Handstand progressions"],
      },
      {
        order: 2,
        slug: "wall-hold-chest",
        nameRu: "Стойка у стены — грудью к стене",
        nameEn: "Wall-assisted (chest-to-wall)",
        descriptionRu:
          "Стойка на руках с опорой ног о стену, грудью к стене. Лучше чем спиной к стене — учит правильному балансу (в плечах).",
        descriptionEn:
          "Handstand with feet on wall, chest to wall. Better than back-to-wall — teaches proper balance (in shoulders).",
        gateSec: 30,
        gateNotesRu:
          "30 секунд грудью к стене, руки на ширине плеч, тело в одну линию, взгляд между рук.",
        gateNotesEn:
          "30 seconds chest-to-wall, hands shoulder-width, body in straight line, gaze between hands.",
        trainingRu:
          "3-5 подходов по 20-30 секунд. 3 раза в неделю. Постепенно увеличивай расстояние от стены.",
        trainingEn:
          "3-5 sets of 20-30 seconds. 3 times per week. Gradually increase distance from wall.",
        assistanceExercises: ["pushup-pike", "shoulder-circles"],
        sources: ["GMB Fitness, Handstand tutorial", "Yuri Marmerstein"],
      },
      {
        order: 3,
        slug: "handstand-wall",
        nameRu: "Стойка на руках у стены (свободная)",
        nameEn: "Handstand (wall-assisted)",
        descriptionRu:
          "Удержание стойки с минимальной опорой о стену (только носки). Готовит к полностью свободной стойке.",
        descriptionEn:
          "Holding handstand with minimal wall support (toes only). Prepares for full freestanding.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд у стены с минимальной опорой (носки касаются, но не давят), тело в идеальной вертикали.",
        gateNotesEn:
          "20 seconds at wall with minimal support (toes touching but not pressing), body in perfect vertical.",
        trainingRu:
          "5 подходов по 15-20 секунд. 3-4 раза в неделю. Практикуй отрыв ног от стены на 1-2 сек.",
        trainingEn:
          "5 sets of 15-20 seconds. 3-4 times per week. Practice lifting feet off wall for 1-2 sec.",
        assistanceExercises: ["wall-hold-chest", "pushup-pike"],
        sources: ["Overcoming Gravity", "GMB Handstand"],
      },
      {
        order: 4,
        slug: "handstand-freestanding",
        nameRu: "Свободная стойка на руках",
        nameEn: "Freestanding handstand",
        descriptionRu:
          "Полностью свободная стойка без опоры. Требует развитого проприоцептивного чувства и баланса в плечах/запястьях.",
        descriptionEn:
          "Fully freestanding handstand without support. Requires developed proprioception and shoulder/wrist balance.",
        gateSec: 20,
        gateNotesRu:
          "20 секунд свободной стойки, без шагов и коррекций, тело в идеальной вертикали.",
        gateNotesEn:
          "20 seconds freestanding, no steps or corrections, body in perfect vertical.",
        trainingRu:
          "Ежедневная практика 10-15 минут. Короткие попытки по 5-10 секунд. Обязательно — видео для самоконтроля.",
        trainingEn:
          "Daily practice 10-15 minutes. Short attempts of 5-10 seconds. Mandatory video for self-check.",
        assistanceExercises: ["handstand-wall", "wall-hold-chest", "shoulder-circles"],
        sources: ["Yuri Marmerstein, Balancing the Equation"],
      },
      {
        order: 5,
        slug: "hspu-wall",
        nameRu: "Отжимания в стойке (HSPU)",
        nameEn: "Handstand push-ups",
        descriptionRu:
          "Отжимания в стойке на руках у стены. Элитный элемент — комбинирует баланс с силой плеч и трицепса.",
        descriptionEn:
          "Push-ups in handstand at wall. Elite element — combines balance with shoulder/triceps strength.",
        gateSec: 0,
        gateReps: 5,
        gateNotesRu: "5 чистых повторений головой до касания пола и обратно вверх, без заваливания.",
        gateNotesEn: "5 clean reps head-to-floor and back up, no tipping.",
        trainingRu: "3-4 подхода по 3-5 повторений. 2-3 раза в неделю. Не чаще — высокая нагрузка на плечи.",
        trainingEn: "3-4 sets of 3-5 reps. 2-3 times per week. Not more — high shoulder load.",
        assistanceExercises: ["handstand-freestanding", "pushup-pike", "hspu-wall"],
        sources: ["Overcoming Gravity, HSPU chapter"],
      },
    ],
  },
];

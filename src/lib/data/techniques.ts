// Seed: библиотека техник ЦНС, ментальных, расслабления, разминки и заминки (~18)
// Структура соответствует типу Technique из lib/types.ts

import type { Technique } from "@/lib/types";

export const TECHNIQUES: Omit<Technique, "id">[] = [
  // ====== ЦНС (CNS) — 6 ======
  {
    slug: "isometric-explosion",
    nameRu: "Изометрический взрыв",
    nameEn: "Isometric explosion",
    category: "cns",
    descriptionRu:
      "Преодолевающая изометрия: максимальное волевое напряжение против неподвижного сопротивления за 2-3 секунды до рабочего подхода.",
    descriptionEn:
      "Overcoming isometric: maximal voluntary effort against an immovable resistance for 2-3 seconds right before the working set.",
    whenToApplyRu:
      "Непосредственно перед тяжёлым подходом (1 повторение максимального усилия, выход на новую прогрессию). Не чаще 1 раза в 3-4 минуты.",
    whenToApplyEn:
      "Immediately before a heavy set (1RM attempt, new progression step). No more than once every 3-4 minutes.",
    stepsRu: [
      "Займи стартовую позицию рабочего упражнения (например, вис на пол-амплитуды).",
      "На 2-3 секунды приложи максимальное усилие против неподвижного сопротивления (перекладина, пол, рама).",
      "Резко сбрось напряжение, выдохни и через 5-10 секунд начинай рабочий подход.",
    ],
    stepsEn: [
      "Assume the start position of the working exercise (e.g. half-pull hang).",
      "Apply maximal effort against an immovable resistance (bar, floor, frame) for 2-3 seconds.",
      "Sharply release tension, exhale, and start the working set after 5-10 seconds.",
    ],
    scienceRu:
      "Изометрический «взрыв» рекрутирует высокопороговые двигательные единицы (ВГ-волокна типа IIx) и активирует постсинаптические потенциалы моторной коры. Эффект пост-активационного потенцирования (PAP) повышает чувствительность миозиновых головок к ионам Ca2+, что на 4-8% увеличивает последующую мощность сокращения.",
    scienceEn:
      "Isometric explosion recruits high-threshold motor units (type IIx fibers) and potentiates motor cortex postsynaptic potentials. Post-activation potentiation (PAP) increases myosin head sensitivity to Ca2+, boosting subsequent contraction power by 4-8%.",
    level: "advanced",
    durationMin: null,
  },
  {
    slug: "irradiation-principle",
    nameRu: "Принцип иррадиации",
    nameEn: "Irradiation principle",
    category: "cns",
    descriptionRu:
      "Сознательное усиление хватом/животом/тазом, чтобы нервный импульс от сильной группы «заражал» соседние мышцы через межсегментарные связи спинного мозга.",
    descriptionEn:
      "Intentional grip/jaw/glute bracing so the neural drive from a strong group spreads to neighbouring muscles via intersegmental spinal connections.",
    whenToApplyRu:
      "В любых силовых подходах, особенно в статике (планки, горизонтальные упоры, флаги) и при выходе на максимум.",
    whenToApplyEn:
      "In any strength set, especially static holds (planks, levers, flags) and max-effort attempts.",
    stepsRu: [
      "Сожми хват сильнее обычного (если упражнение на перекладине) или упрись стопами в пол.",
      "Лёгким напряжением ягодиц и брюшного пресса «включи» кор.",
      "Сохраняй это «двойное» напряжение всё время подхода, не расслабляясь между повторениями.",
    ],
    stepsEn: [
      "Squeeze the grip harder than usual (on the bar) or drive feet into the floor.",
      "Lightly brace glutes and abs to engage the core.",
      "Maintain this dual tension throughout the set, not relaxing between reps.",
    ],
    scienceRu:
      "Иррадиация — нейрофизиологический феномен, описанный Sherrington: возбуждение одной альфа-мотонейронной pool распространяется на соседние сегменты через вставочные нейроны. Сильный хват активирует кортикоспинальный путь к широчайшим через общие нисходящие команды.",
    scienceEn:
      "Irradiation is a neurophysiological phenomenon described by Sherrington: excitation of one alpha-motor-neuron pool spreads to adjacent segments via interneurons. Strong grip activates the corticospinal drive to lats through shared descending commands.",
    level: "intermediate",
    durationMin: null,
  },
  {
    slug: "post-activation-potentiation",
    nameRu: "PAP — пост-активационное потенцирование",
    nameEn: "Post-activation potentiation (PAP)",
    category: "cns",
    descriptionRu:
      "Контрастная изометрия: 3-5 секунд максимального изометрического напряжения в верхнем положении, после которого рабочее движение ощущается легче.",
    descriptionEn:
      "Contrast isometric: 3-5 seconds of maximal isometric tension in the top position, after which the working movement feels easier.",
    whenToApplyRu:
      "Перед силовым подходом на 1-3 повторения или перед изучением новой прогрессии. Эффект держится 4-7 минут.",
    whenToApplyEn:
      "Before a strength set of 1-3 reps or before attempting a new progression. Effect lasts 4-7 minutes.",
    stepsRu: [
      "Займи положение максимального сокращения целевой мышцы (верх подтягивания, упор на брусьях).",
      "Создай максимальное волевое напряжение на 3-5 секунд, не задерживая дыхание.",
      "Вернись в старт, отдохни 1-2 минуты, затем выполняй рабочий подход.",
    ],
    stepsEn: [
      "Assume the position of maximal contraction of the target muscle (top of pull-up, dip support).",
      "Generate maximal voluntary tension for 3-5 seconds without holding the breath.",
      "Return to start, rest 1-2 minutes, then perform the working set.",
    ],
    scienceRu:
      "PAP работает через фосфорилирование регуляторной лёгкой цепи миозина, что повышает чувствительность сократительного аппарата к Ca2+. Параллельно снижается пресинаптическое торможение Ia-афферентов, что усиливает последующее мышечное сокращение на 3-7%.",
    scienceEn:
      "PAP works via phosphorylation of the myosin regulatory light chain, increasing contractile apparatus sensitivity to Ca2+. Concurrent reduction in presynaptic inhibition of Ia afferents enhances the subsequent contraction by 3-7%.",
    level: "advanced",
    durationMin: null,
  },
  {
    slug: "tactile-anchoring",
    nameRu: "Тактильное якорение",
    nameEn: "Tactile anchoring",
    category: "cns",
    descriptionRu:
      "Сознательная фокусировка на одной тактильной точке (хват, стопа, прижим подбородка), чтобы создать устойчивый условный рефлекс на правильную технику.",
    descriptionEn:
      "Conscious focus on a single tactile point (grip, foot, chin contact) to build a stable conditioned reflex on correct technique.",
    whenToApplyRu:
      "При изучении новых движений и при «отлове» технических ошибок. Также в подходах на технику (skill work).",
    whenToApplyEn:
      "When learning new movements and chasing down technical errors. Also in skill work sets.",
    stepsRu: [
      "Выбери одну тактильную точку, которая является индикатором правильной техники (например, прижим подбородка в горизонте).",
      "Перед подходом мысленно проговори: «Я чувствую эту точку всё время».",
      "В ходе движения удерживай внимание именно на тактильном ощущении, а не на мышцах.",
    ],
    stepsEn: [
      "Choose one tactile point that indicates correct technique (e.g. chin tuck in a back lever).",
      "Before the set, mentally state: 'I feel this point the entire time'.",
      "During the movement, keep attention on the tactile sensation rather than the muscles.",
    ],
    scienceRu:
      "Тактильное якорение эксплуатирует соматосенсорную кору и её связь с моторной. Сосредоточение на одной афферентной точке подавляет «шум» от прочих сенсорных потоков и упрочняет энграмму движения через долговременную потенциацию (LTP) в коре мозжечка.",
    scienceEn:
      "Tactile anchoring exploits the somatosensory cortex and its link to motor cortex. Focusing on a single afferent point suppresses noise from other sensory streams and consolidates the motor engram via long-term potentiation (LTP) in the cerebellar cortex.",
    level: "intermediate",
    durationMin: null,
  },
  {
    slug: "elbow-biomech-lock",
    nameRu: "Биомеханический замок локтя",
    nameEn: "Elbow biomechanical lock",
    category: "cns",
    descriptionRu:
      "Одновременное сознательное напряжение бицепса и трицепса для стабилизации локтевого сустава и снижения нагрузки на дистальное сухожилие бицепса.",
    descriptionEn:
      "Simultaneous conscious tension of the biceps and triceps to stabilise the elbow joint and reduce load on the distal biceps tendon.",
    whenToApplyRu:
      "В планше, малингезе, горизонтальных упорах и других статических элементах с большой нагрузкой на локоть.",
    whenToApplyEn:
      "In planche, maltese, back/front levers and other static elements with high elbow load.",
    stepsRu: [
      "Выйди в целевое статическое положение.",
      "Сознательно напряги трицепс, «выкручивая» локоть в разгибание.",
      "Одновременно сохрани лёгкое напряжение бицепса — сустав оказывается зажат между двумя мышцами.",
      "Удерживай двойное напряжение всё время статики.",
    ],
    stepsEn: [
      "Enter the target static position.",
      "Consciously engage the triceps, 'screwing' the elbow into extension.",
      "Simultaneously keep light biceps tension — the joint is clamped between two muscles.",
      "Hold the dual tension throughout the static hold.",
    ],
    scienceRu:
      "Co-contraction антагонистов снижает сдвигающие силы на суставную капсулу и дистальное сухожилие бицепса. Двусуставная анатомия бицепса (длинная головка пересекает плечевой сустав) делает его сухожилия уязвимыми при разнонаправленных нагрузках. Стабилизация трицепсом переводит сустав в «закрытый кинематический пакет» с пониженным риском подвывиха.",
    scienceEn:
      "Antagonist co-contraction reduces shear forces on the joint capsule and distal biceps tendon. The biarticular anatomy of the biceps (long head crosses the shoulder) makes its tendons vulnerable to multidirectional loads. Triceps stabilisation shifts the joint into a 'closed kinetic package' with reduced subluxation risk.",
    level: "intermediate",
    durationMin: null,
  },
  {
    slug: "temperature-anchor",
    nameRu: "Температурный якорь",
    nameEn: "Temperature anchor",
    category: "cns",
    descriptionRu:
      "Кратковременное (1-2 минуты) локальное охлаждение предплечий или кистей перед силовым подходом для повышения нейромышечной активации.",
    descriptionEn:
      "Brief (1-2 minutes) local cooling of the forearms or hands before a strength set to enhance neuromuscular activation.",
    whenToApplyRu:
      "Перед соревновательным или максимальным подходом на хват/тягу. Не чаще 1 раза в 15 минут, не на повреждённую кожу.",
    whenToApplyEn:
      "Before a competition or max attempt on grip/pull movements. No more than once every 15 minutes, not on damaged skin.",
    stepsRu: [
      "Подготовь холодовый элемент (лёд в ткани, холодный баллончик, охлаждённый мячик).",
      "Приложи к предплечью или кисти на 60-120 секунд.",
      "Сними холод, дай коже 30-60 секунд восстановить температуру, затем выполняй подход.",
    ],
    stepsEn: [
      "Prepare a cold element (ice in a cloth, cold spray, chilled ball).",
      "Apply to forearm or hand for 60-120 seconds.",
      "Remove cold, let skin temperature recover for 30-60 seconds, then perform the set.",
    ],
    scienceRu:
      "Локальное охлаждение 10-15°C повышает возбудимость крупных миелинизированных афферентов (Ia, Ib) и снижает порог моторных единиц. Эффект схож с холодовым душем для нервной системы: краткий стресс активирует симпатоадреналовую ось, что увеличивает выброс норадреналина в синапсах. Глубокое или длительное охлаждение, наоборот, замедляет нервную проводимость.",
    scienceEn:
      "Local cooling at 10-15°C raises excitability of large myelinated afferents (Ia, Ib) and lowers the motor unit threshold. The effect is similar to a cold shower for the nervous system: brief stress activates the sympathoadrenal axis, increasing noradrenaline release at synapses. Deep or prolonged cooling, on the contrary, slows nerve conduction.",
    level: "advanced",
    durationMin: 2,
  },

  // ====== МЕНТАЛЬНЫЕ (MENTAL) — 5 ======
  {
    slug: "external-focus",
    nameRu: "Внешний фокус внимания",
    nameEn: "External focus of attention",
    category: "mental",
    descriptionRu:
      "Смещение внимания с собственных мышц на внешний объект: «продавить пол», «разорвать перекладину», «прижать локти к рёбрам».",
    descriptionEn:
      "Shifting attention from one's own muscles to an external object: 'push the floor away', 'snap the bar', 'squeeze elbows to ribs'.",
    whenToApplyRu:
      "В любых подходах на технику и силу. Особенно полезно новичкам и при перенапряжении (over-coaching).",
    whenToApplyEn:
      "In any technical or strength set. Especially useful for beginners and over-coached athletes.",
    stepsRu: [
      "Перед подходом сформулируй внешнюю задачу: «Я отталкиваю пол», «Я тяну перекладину вниз».",
      "В ходе движения удерживай образ внешнего объекта, а не своих мышц.",
      "Если внимание «уползло» внутрь, на выдохе вернись к внешней точке.",
    ],
    stepsEn: [
      "Before the set, phrase an external task: 'I push the floor away', 'I pull the bar down'.",
      "During the movement, keep the image of an external object rather than your muscles.",
      "If attention drifts inward, on the exhale return to the external point.",
    ],
    scienceRu:
      "Концепция constrained action hypothesis (Wulf, 2007): внутренний фокус сознательно ограничивает автоматизированные моторные программы, повышая мышечную ко-контракцию и снижая эффективность. Внешний фокус делегирует управление спинальным и кортикальным автоматизмам, что снижает EMG-активность антагонистов на 10-20%.",
    scienceEn:
      "The constrained action hypothesis (Wulf, 2007): internal focus consciously restricts automated motor programs, increasing antagonist co-contraction and reducing efficiency. External focus delegates control to spinal and cortical automatisms, reducing antagonist EMG activity by 10-20%.",
    level: "beginner",
    durationMin: null,
  },
  {
    slug: "static-muscle-scan",
    nameRu: "Мышечное сканирование в статике",
    nameEn: "Static muscle scan",
    category: "mental",
    descriptionRu:
      "Мысленный пробег по точкам контроля тела в статическом элементе: от стоп до кистей — поиск «провалов» в напряжении.",
    descriptionEn:
      "Mental pass over body control points in a static hold: from feet to hands — searching for 'gaps' in tension.",
    whenToApplyRu:
      "Во время длинных статических удержаний (планка 60+ сек, горизонтальный упор, задняя балансировка).",
    whenToApplyEn:
      "During long static holds (60+ sec plank, back/front lever, L-sit).",
    stepsRu: [
      "Займи статическое положение и стабилизируй дыхание.",
      "Мысленно пройди снизу вверх: стопы, икры, бёдра, ягодицы, кор, спина, плечи, шея, кисти.",
      "В каждой точке задай вопрос: «Напряжено ли здесь?» — если нет, добавь 5-10% усилия.",
      "Закончи сканирование, когда дойдёшь до кистей, и удерживай найденный тонус.",
    ],
    stepsEn: [
      "Assume the static position and stabilise your breath.",
      "Mentally scan from bottom to top: feet, calves, thighs, glutes, core, back, shoulders, neck, hands.",
      "At each point, ask: 'Is this tense?' — if not, add 5-10% effort.",
      "Finish the scan when you reach the hands, and hold the discovered tone.",
    ],
    scienceRu:
      "Проприоцептивная кора мозжечка и соматосенсорная кора S1 поддерживают «карту тела». Сознательное сканирование усиливает афферентный поток от мышечных веретён и сухожильных органов Гольджи, что улучшает координацию и выявляет «засыпающие» сегменты до того, как они приведут к потере формы.",
    scienceEn:
      "The proprioceptive cerebellar cortex and somatosensory cortex S1 maintain a 'body map'. Conscious scanning amplifies the afferent flow from muscle spindles and Golgi tendon organs, improving coordination and identifying 'sleeping' segments before they cause form breakdown.",
    level: "intermediate",
    durationMin: null,
  },
  {
    slug: "blind-training",
    nameRu: "Слепая тренировка",
    nameEn: "Blind training",
    category: "mental",
    descriptionRu:
      "Выполнение знакомых движений с закрытыми глазами для форсированного развития проприоцепции и устранения визуальной зависимости.",
    descriptionEn:
      "Performing familiar movements with eyes closed to force-proprioception development and eliminate visual dependence.",
    whenToApplyRu:
      "В разминочных подходах знакомых движений, в статике, в комплексной суставной гимнастике. Не на новых прогрессиях.",
    whenToApplyEn:
      "In warm-up sets of familiar movements, in statics, in joint mobility routines. Not on new progressions.",
    stepsRu: [
      "Выбери знакомое упражнение, которое можешь выполнить безопасно.",
      "Закрой глаза мягко, без зажмуривания, расслабь веки.",
      "Сфокусируйся на ощущениях в суставах и мышцах.",
      "Открой глаза только в случае потери равновесия или дискомфорта.",
    ],
    stepsEn: [
      "Choose a familiar exercise you can perform safely.",
      "Close your eyes softly, without squeezing, relax the eyelids.",
      "Focus on sensations in the joints and muscles.",
      "Open your eyes only if you lose balance or feel discomfort.",
    ],
    scienceRu:
      "Лишение зрительной афферентации принуждает мозг опираться на проприоцептивный поток от мышечных веретён, суставных рецепторов и вестибулярного аппарата. Через 4-6 недель такой практики S1-карта тела расширяется, а латентность моторной реакции снижается. Эффект показан в исследованиях Proprioceptive Neuromuscular Facilitation (PNF).",
    scienceEn:
      "Deprivation of visual afferents forces the brain to rely on proprioceptive flow from muscle spindles, joint receptors and the vestibular system. After 4-6 weeks of practice the S1 body map expands and motor reaction latency drops. The effect is shown in Proprioceptive Neuromuscular Facilitation (PNF) research.",
    level: "intermediate",
    durationMin: null,
  },
  {
    slug: "movement-visualization",
    nameRu: "Визуализация движения",
    nameEn: "Movement visualization",
    category: "mental",
    descriptionRu:
      "Мысленное прохождение движения от первого до последнего кадра с детальной сенсорной проработкой перед физическим выполнением.",
    descriptionEn:
      "Mental rehearsal of a movement from first to last frame with detailed sensory elaboration before physical execution.",
    whenToApplyRu:
      "Перед сложным навыком (новая прогрессия, выход на горизонт, элемент на кольцах) или при невозможности физической практики.",
    whenToApplyEn:
      "Before a complex skill (new progression, back lever attempt, ring element) or when physical practice is impossible.",
    stepsRu: [
      "Сядь или встань в спокойной позе, сделай 3-5 медленных дыханий.",
      "Мысленно увидь себя в стартовой позиции со стороны.",
      "Прокрути движение в замедленном темпе, отслеживая хват, дыхание, тактильные ощущения.",
      "Заверши мысленный кадр успешным финалом и сохрани это состояние.",
    ],
    stepsEn: [
      "Sit or stand in a calm posture, take 3-5 slow breaths.",
      "Mentally see yourself in the start position from outside.",
      "Play the movement in slow motion, tracking grip, breath, tactile sensations.",
      "Finish the mental frame with a successful ending and preserve this state.",
    ],
    scienceRu:
      "Mental rehearsal активирует те же зоны моторной коры (M1, премоторная, дополнительная моторная зона), что и реальное движение, с EMG-амплитудой 5-15% от физического. Картирование нейронных ансамблей укрепляется через LTP без реальной нагрузки — эффективно для навыка, но не для гипертрофии.",
    scienceEn:
      "Mental rehearsal activates the same motor cortex areas (M1, premotor, supplementary motor area) as actual movement, with EMG amplitude 5-15% of physical. Mapping of neural ensembles is consolidated via LTP without physical load — effective for skill, not for hypertrophy.",
    level: "beginner",
    durationMin: 3,
  },
  {
    slug: "cognitive-noise",
    nameRu: "Когнитивный шум",
    nameEn: "Cognitive noise",
    category: "mental",
    descriptionRu:
      "Параллельное прослушивание иностранной речи (подкаст, аудиокнига) во время лёгкой технической практики, чтобы вытеснить внутренний диалог и снизить «перегревание» ЦНС.",
    descriptionEn:
      "Parallel listening to foreign speech (podcast, audiobook) during light technical practice to displace inner dialogue and reduce CNS 'overheating'.",
    whenToApplyRu:
      "В длинных объёмных тренировках (volume days), при отработке техники, в восстановительных сессиях. Не на максимальных подходах.",
    whenToApplyEn:
      "During long volume days, technique practice, recovery sessions. Not on maximal attempts.",
    stepsRu: [
      "Включи подкаст или аудиокнигу на незнакомом или слабо знакомом иностранном языке.",
      "Сделай громкость достаточной для узнавания речи, но не для понимания смысла.",
      "Выполняй тренировку, позволяя речи звучать фоном.",
      "Если внимание «прилипает» к смыслу, переключи на другой язык.",
    ],
    stepsEn: [
      "Turn on a podcast or audiobook in an unfamiliar or weakly familiar language.",
      "Set the volume loud enough to recognise speech but not loud enough to grasp meaning.",
      "Train, letting the speech play in the background.",
      "If attention latches onto meaning, switch languages.",
    ],
    scienceRu:
      "Эффект основан на когнитивной нагрузке: слуховая кора занята декодированием фонетики, что снижает ресурсы префронтальной коры на вербализацию внутреннего диалога («я устал», «ещё 5 раз»). Это понижает субъективную тяжесть работы по Borg scale на 1-2 балла без изменения физиологических показателей.",
    scienceEn:
      "The effect is grounded in cognitive load: the auditory cortex is busy decoding phonetics, reducing prefrontal resources available for verbalising inner dialogue ('I'm tired', '5 more reps'). This lowers subjective effort on the Borg scale by 1-2 points without changing physiological markers.",
    level: "advanced",
    durationMin: null,
  },

  // ====== РАССЛАБЛЕНИЕ (RELAX) — 4 ======
  {
    slug: "jacobson-progressive-relaxation",
    nameRu: "Прогрессивная релаксация по Джекобсону",
    nameEn: "Jacobson's progressive relaxation",
    category: "relax",
    descriptionRu:
      "Последовательное 5-10-секундное напряжение и расслабление мышечных групп сверху вниз для снятия остаточного тонуса после тренировки.",
    descriptionEn:
      "Sequential 5-10-second tensing and relaxing of muscle groups top to bottom to release residual tone after training.",
    whenToApplyRu:
      "Сразу после тренировки или перед сном. Особенно показана при гипертонусе и нарушениях сна.",
    whenToApplyEn:
      "Right after training or before sleep. Especially indicated for hypertonia and sleep disorders.",
    stepsRu: [
      "Ляг на спину, руки вдоль тела, ноги слегка расставлены.",
      "Поочерёдно напрягай группы на 5-7 секунд: кисти, предплечья, плечи, лицо, шея, грудь, живот, ягодицы, бёдра, голени, стопы.",
      "После каждой группы делай 10-секундное расслабление и замечай разницу.",
      "Заверши сессию 30-секундным полным расслаблением тела.",
    ],
    stepsEn: [
      "Lie on your back, arms alongside the body, legs slightly apart.",
      "Sequentially tense each muscle group for 5-7 seconds: hands, forearms, shoulders, face, neck, chest, abs, glutes, thighs, calves, feet.",
      "After each group, relax for 10 seconds and notice the contrast.",
      "Finish with a 30-second whole-body relaxation.",
    ],
    scienceRu:
      "Прогрессивная релаксация активирует парасимпатическую ветвь ВНС через барорефлекторный ответ: глубокое дыхание и расслабление крупных мышц повышают тонус блуждающего нерва (vagal tone). HRV-метрики (RMSSD, pNN50) повышаются на 15-25% после 10-минутной сессии, что ускоряет восстановление гликогена и снижает кортизол.",
    scienceEn:
      "Progressive relaxation activates the parasympathetic branch of the ANS via the baroreflex: deep breathing and large-muscle relaxation raise vagal tone. HRV metrics (RMSSD, pNN50) increase by 15-25% after a 10-minute session, accelerating glycogen recovery and lowering cortisol.",
    level: "beginner",
    durationMin: 10,
  },
  {
    slug: "square-breathing",
    nameRu: "Дыхание по квадрату",
    nameEn: "Box breathing",
    category: "relax",
    descriptionRu:
      "Ритмичное дыхание с равными фазами 4-4-4-4 (вдох-задержка-выдох-задержка) для быстрой активации парасимпатики и успокоения ЦНС.",
    descriptionEn:
      "Rhythmic breathing with equal 4-4-4-4 phases (inhale-hold-exhale-hold) for quick parasympathetic activation and CNS calming.",
    whenToApplyRu:
      "Между тяжёлыми подходами (3-5 циклов), после тренировки, перед сном, при стрессе.",
    whenToApplyEn:
      "Between heavy sets (3-5 cycles), after training, before sleep, under stress.",
    stepsRu: [
      "Сядь прямо, расслабь плечи, мягко прикрой глаза.",
      "Вдох носом на 4 счёта, заполняя живот, потом грудь.",
      "Задержи дыхание на 4 счёта, сохраняя лёгкое напряжение в животе.",
      "Выдох на 4 счёта через нос или рот, полностью опустошая лёгкие.",
      "Задержи дыхание на 4 счёта на пустых лёгких, затем повтори.",
    ],
    stepsEn: [
      "Sit up straight, relax the shoulders, softly close the eyes.",
      "Inhale through the nose for 4 counts, filling belly then chest.",
      "Hold the breath for 4 counts, keeping light abdominal tension.",
      "Exhale for 4 counts through nose or mouth, fully emptying the lungs.",
      "Hold the breath for 4 counts on empty lungs, then repeat.",
    ],
    scienceRu:
      "Дыхание с удлинённым выдохом и равными фазами стимулирует блуждающий нерв через барорефлекторную зону каротидного синуса. HRV-показатель LF/HF сдвигается в сторону парасимпатики, ЧСС снижается на 5-10 ударов, а субъективная тревожность по STAI падает на 20-30%. Эффект проявляется уже через 5 циклов.",
    scienceEn:
      "Breathing with an elongated exhale and equal phases stimulates the vagus nerve via the carotid sinus baroreceptor zone. The LF/HF HRV ratio shifts toward parasympathetics, HR drops by 5-10 bpm, and subjective STAI anxiety falls by 20-30%. The effect appears after just 5 cycles.",
    level: "beginner",
    durationMin: 5,
  },
  {
    slug: "autogenic-training",
    nameRu: "Аутогенная тренировка",
    nameEn: "Autogenic training",
    category: "relax",
    descriptionRu:
      "Систематическое самовнушение формул тяжести, тепла и спокойствия в положении лёжа для глубокого расслабления и восстановления.",
    descriptionEn:
      "Systematic self-suggestion of heaviness, warmth and calmness formulas in a lying position for deep relaxation and recovery.",
    whenToApplyRu:
      "В дни интенсивных тренировок перед сном, в восстановительные дни, при перетренированности.",
    whenToApplyEn:
      "On hard training days before sleep, on recovery days, in overtraining states.",
    stepsRu: [
      "Ляг на спину или прими позу «кучера», закрой глаза, сделай 5-8 спокойных дыханий.",
      "Про себя повторяй формулы: «Моя правая рука тяжёлая» (6 раз), затем «Моя правая рука тёплая» (6 раз).",
      "Перенеси формулы на левую руку, обе ноги, всё тело.",
      "Заканчивай формулой: «Я спокоен, моё тело восстановилось».",
      "Для выхода: глубокий вдох, сжатие кулаков, открытие глаз.",
    ],
    stepsEn: [
      "Lie on your back or assume the 'coachman' pose, close your eyes, take 5-8 calm breaths.",
      "Silently repeat: 'My right arm is heavy' (6 times), then 'My right arm is warm' (6 times).",
      "Transfer the formulas to the left arm, both legs, the whole body.",
      "End with: 'I am calm, my body has recovered'.",
      "Exit: deep breath, clench fists, open eyes.",
    ],
    scienceRu:
      "Аутогенная тренировка (Schultz, 1932) — клинически валидированный метод снижения активности симпатоадреналовой оси. Формулы тяжести вызывают периферическую вазодилатацию через снижение сосудосуживающего тонуса, формулы тепла — активацию парасимпатики. Уровень кортизола и ЧСС снижаются на 10-15%, а субъективное качество сна улучшается.",
    scienceEn:
      "Autogenic training (Schultz, 1932) is a clinically validated method of reducing the sympathoadrenal axis. Heaviness formulas induce peripheral vasodilation via reduced vasoconstrictor tone; warmth formulas activate parasympathetics. Cortisol and HR drop by 10-15%, and subjective sleep quality improves.",
    level: "intermediate",
    durationMin: 15,
  },
  {
    slug: "micro-tensions",
    nameRu: "Микро-напряжения",
    nameEn: "Micro tensions",
    category: "relax",
    descriptionRu:
      "Серия коротких (5-10 секунд) изолированных статических напряжений отдельных мышц в течение дня для активного восстановления и снятия скованности.",
    descriptionEn:
      "A series of short (5-10 second) isolated static tensions of individual muscles throughout the day for active recovery and relief of stiffness.",
    whenToApplyRu:
      "В течение дня, особенно при сидячей работе, между долгими статичными периодами. Не на повреждённых мышцах.",
    whenToApplyEn:
      "Throughout the day, especially during sedentary work, between long static periods. Not on injured muscles.",
    stepsRu: [
      "Найди зажатую или «заснувшую» мышцу (например, среднюю ягодичную при долгом сидении).",
      "Сознательно напряги её на 5-10 секунд в изоляции от соседних мышц.",
      "Полностью расслабь и заметь разницу в ощущении.",
      "Повтори для 3-5 разных мышц в течение дня.",
    ],
    stepsEn: [
      "Find a tight or 'sleeping' muscle (e.g. gluteus medius after long sitting).",
      "Consciously tense it for 5-10 seconds in isolation from neighbouring muscles.",
      "Fully relax and notice the difference in sensation.",
      "Repeat for 3-5 different muscles throughout the day.",
    ],
    scienceRu:
      "Короткие изолированные напряжения стимулируют мышечные веретёна и механизмы ауторегуляции тонуса через гамма-петлю. Краткое сокращение-расслабление улучшает локальный кровоток и отток метаболитов. Подход близок к PNF и используется в двигательной терапии (Movement Therapy) для снятия мышечно-тонических синдромов.",
    scienceEn:
      "Short isolated tensions stimulate muscle spindles and tone autoregulation via the gamma loop. Brief contraction-relaxation improves local blood flow and metabolite clearance. The approach is close to PNF and is used in movement therapy to relieve muscle-tonic syndromes.",
    level: "beginner",
    durationMin: 3,
  },

  // ====== РАЗМИНКА (WARMUP) — 2 ======
  {
    slug: "joint-gymnastics",
    nameRu: "Суставная гимнастика",
    nameEn: "Joint mobility routine",
    category: "warmup",
    descriptionRu:
      "Комплекс суставных вращений сверху вниз для смазки суставов, активации проприоцепции и подготовки нервной системы к нагрузке.",
    descriptionEn:
      "Top-to-bottom joint rotation complex to lubricate joints, activate proprioception and prepare the nervous system for load.",
    whenToApplyRu:
      "В самом начале тренировки, до любой силовой работы. Длительность 8-12 минут.",
    whenToApplyEn:
      "At the very start of training, before any strength work. Duration 8-12 minutes.",
    stepsRu: [
      "Шея: мягкие наклоны и вращения (по 8-10 в каждую сторону).",
      "Плечи: вращения назад и вперёд (по 10 в каждую сторону).",
      "Локти и кисти: сгибания, вращения (по 10).",
      "Грудной отдел: «кошка-корова» 8-10 повторений.",
      "Таз: вращения тазом по кругу (по 10 в каждую сторону).",
      "Колени и стопы: вращения голеностопом, мягкие приседы (по 10).",
    ],
    stepsEn: [
      "Neck: soft tilts and rotations (8-10 each way).",
      "Shoulders: forward and backward rotations (10 each way).",
      "Elbows and wrists: flexion and rotations (10 each).",
      "Thoracic spine: cat-cow for 8-10 reps.",
      "Hips: pelvic circles (10 each way).",
      "Knees and ankles: ankle rotations, soft squats (10 each).",
    ],
    scienceRu:
      "Суставная гимнастика стимулирует выработку синовиальной жидкости (диализ через движение), активирует проприоцепторы суставной капсулы и механорецепторы связок. Динамическая мобилизация повышает температуру тканей на 1-2°C, что снижает вязкость мышечно-сухожильных единиц и повышает их упругость. Параллельно активируется ретикулярная формация ствола мозга.",
    scienceEn:
      "Joint mobility stimulates synovial fluid production (dialysis through movement), activates joint capsule proprioceptors and ligament mechanoreceptors. Dynamic mobilisation raises tissue temperature by 1-2°C, reducing the viscosity of musculotendinous units and increasing their elasticity. It also activates the brainstem reticular formation.",
    level: "beginner",
    durationMin: 10,
  },
  {
    slug: "dynamic-stretch",
    nameRu: "Динамическая растяжка",
    nameEn: "Dynamic stretching",
    category: "warmup",
    descriptionRu:
      "Контролируемые маховые и пружинящие движения в полной амплитуде для подготовки мышц к активной работе без потери взрывной силы.",
    descriptionEn:
      "Controlled swinging and bouncing movements in full range of motion to prepare muscles for active work without losing explosive power.",
    whenToApplyRu:
      "После суставной гимнастики, до основной тренировки. Особенно перед взрывными и силовыми элементами.",
    whenToApplyEn:
      "After joint mobility, before the main training. Especially before explosive and strength elements.",
    stepsRu: [
      "Махи ногами вперёд-назад и в стороны (по 8-10 на каждую ногу).",
      "Глубокие выпады с вращением корпуса (по 6-8 на каждую сторону).",
      "Пружинящие наклоны вперёд к прямым ногам и в стороны (по 8).",
      "Динамические вращения руками в горизонтальной плоскости (по 10).",
      "Прогулка фермера на руках («паук») 10-15 метров.",
    ],
    stepsEn: [
      "Leg swings forward-back and to the sides (8-10 each leg).",
      "Deep lunges with torso rotation (6-8 each side).",
      "Bouncing forward bends to straight legs and to the sides (8 each).",
      "Dynamic horizontal arm rotations (10 each).",
      "Inchworm / spider walk for 10-15 metres.",
    ],
    scienceRu:
      "Динамическая растяжка, в отличие от статической, не снижает последующую взрывную силу (потеря до 5% после 30-секундной статической задержки). Движения в полной амплитуде активируют мышечные веретёна и сухожильный рефлекс растяжения (myotatic reflex), что повышает мышечную температуру и эластичность сухожильно-связочного аппарата. Пульсовая зона 100-130 уд/мин подготавливает сердечно-сосудистую систему.",
    scienceEn:
      "Dynamic stretching, unlike static, does not reduce subsequent explosive power (loss up to 5% after a 30-second static hold). Full-range movements activate muscle spindles and the myotatic stretch reflex, raising muscle temperature and tendon-ligament elasticity. Heart rate zone 100-130 bpm prepares the cardiovascular system.",
    level: "beginner",
    durationMin: 8,
  },

  // ====== ЗАМИНКА (COOLDOWN) — 1 ======
  {
    slug: "myofascial-release-ball",
    nameRu: "Миофасциальный релиз с мячиком",
    nameEn: "Myofascial release with a ball",
    category: "cooldown",
    descriptionRu:
      "Локальное давление теннисным или массажным мячиком на триггерные точки ладони, предплечья, стопы и грудных мышц для снятия фасциальных спаек.",
    descriptionEn:
      "Local pressure with a tennis or massage ball on trigger points of the palm, forearm, foot and chest to release fascial adhesions.",
    whenToApplyRu:
      "В конце тренировки (10 минут) или в восстановительные дни. Не на острых травмах.",
    whenToApplyEn:
      "At the end of training (10 minutes) or on recovery days. Not on acute injuries.",
    stepsRu: [
      "Найди чувствительную точку (ладонь под пальцами, предплечье, свод стопы, грудная мышца).",
      "Помести мячик между точкой и твёрдой поверхностью (пол, стол, стена).",
      "Надави массой тела до ощущения «приятной боли» 6-7 из 10.",
      "Удерживай давление 60-90 секунд до ощущения размягчения.",
      "Медленно отпусти и выполни 3-4 активных движения в соответствующем суставе.",
    ],
    stepsEn: [
      "Find a tender point (palm under the fingers, forearm, foot arch, chest).",
      "Place the ball between the point and a hard surface (floor, table, wall).",
      "Lean body weight in until you feel 'pleasant pain' of 6-7 out of 10.",
      "Hold the pressure for 60-90 seconds until a softening sensation arises.",
      "Slowly release and perform 3-4 active movements in the relevant joint.",
    ],
    scienceRu:
      "Продолжительное давление на миофасциальные триггерные точки активирует механорецепторы фасциальной ткани (тип I и II), что подавляет ноцицептивный поток через воротный механизм (gate control theory, Melzack-Wall). Это снижает тонус мышечных веретён, улучшает кровоток в зоне точек и стимулирует фибробласты к обновлению внеклеточного матрикса.",
    scienceEn:
      "Sustained pressure on myofascial trigger points activates fascial mechanoreceptors (type I and II), suppressing nociceptive flow via the gate control mechanism (Melzack-Wall). This lowers muscle spindle tone, improves blood flow in the point region and stimulates fibroblasts to renew the extracellular matrix.",
    level: "intermediate",
    durationMin: 10,
  },

  // ====== Лайфхаки от мастеров статики (из чата с Gemini) ======

  // Лайфхак 1: Правило 3 секунд Жиронды
  {
    slug: "gironda-3sec-rule",
    nameRu: "Правило 3 секунд Жиронды",
    nameEn: "Gironda 3-second rule",
    category: "cns",
    descriptionRu:
      "Техника мастеров статики: в подтягиваниях Жиронды коснуться перекладины грудиной недостаточно — нужно зафиксировать пиковое сокращение на 1-2 секунды (в идеале до 3), чтобы мозг запомнил это положение как «статическую точку». Это критический перенос силы в передний вис.",
    descriptionEn:
      "Static masters' technique: in Gironda pull-ups, touching the bar with sternum is not enough — you must hold the peak contraction for 1-2 seconds (ideally up to 3) so the brain memorizes this position as a «static point». This is critical for force transfer to front lever.",
    whenToApplyRu:
      "В каждой репетиции подтягиваний Жиронды. Особенно важно для атлетов, идущих к переднему вису — выполнять как подводящее движение с паузой в верхней точке.",
    whenToApplyEn:
      "On every rep of Gironda pull-ups. Especially important for athletes working toward front lever — perform as a progression with a pause at the top.",
    stepsRu: [
      "Подтянись по технике Жиронды (тело под 45°, грудь дугой) до касания грудиной перекладины.",
      "В верхней точке сознательно сожми широчайшие и ромбовидные, зафиксировав пиковое сокращение.",
      "Досчитай про себя «раз-два-три» (1-2-3), удерживая положение и дыхание.",
      "На «три» начни подконтрольное опускание (3 секунды вниз — эксцентрическая фаза).",
      "В нижней точке не расслабляйся полностью — сразу следующее повторение.",
    ],
    stepsEn: [
      "Pull up Gironda-style (body at 45°, chest arched) until sternum touches the bar.",
      "At the top, consciously squeeze lats and rhomboids, holding the peak contraction.",
      "Count to yourself «one-two-three», holding the position and breath.",
      "On «three», begin controlled lowering (3 seconds down — eccentric phase).",
      "Don't fully relax at the bottom — go straight into the next rep.",
    ],
    scienceRu:
      "Изометрическая пауза в пиковом сокращении создаёт так называемое «статическое окно»: ЦНС запоминает паттерн активации мышц в этом положении. Это улучшает нейромышечную координацию и облегчает перенос силы в динамические и статические элементы (передний вис). Принцип time-under-tension (TUT) хорошо известен в спортивной науке — изометрическая пауза увеличивает общее время под нагрузкой без пропорционального роста утомления. Конкретные проценты варьируют — нет универсального числа.",
    scienceEn:
      "Isometric pause at peak contraction creates a «static window»: CNS memorizes the muscle activation pattern in this position. This improves neuromuscular coordination and facilitates force transfer to dynamic and static elements (front lever). The time-under-tension (TUT) principle is well-known in sports science — isometric pause increases total time under load without proportional fatigue growth. Specific percentages vary — there is no universal number.",
    level: "advanced",
    durationMin: null,
  },

  // Лайфхак 2: «Пружина» Тайсона
  {
    slug: "tyson-spring-press",
    nameRu: "Пружина Тайсона — вдавливание и скручивание",
    nameEn: "Tyson spring — press and twist",
    category: "cns",
    descriptionRu:
      "Техника безопасности и усиления отжиманий Тайсона: при уводе таза назад в нижней точке ладони должны выполнять ментальное «вдавливание и скручивание» в пол. Это активирует ротаторную манжету плеча и зубчатую мышцу, защищая сустав при последующем взрывном выталкивании.",
    descriptionEn:
      "Safety and power technique for Tyson push-ups: when driving hips back at the bottom, palms must mentally «press and twist» into the floor. This activates the rotator cuff and serratus anterior, protecting the joint during the subsequent explosive push.",
    whenToApplyRu:
      "В каждой репетиции отжиманий Тайсона, в фазе «пружины» (когда таз уводится назад к ногам). Также применимо к любым плиометрическим отжиманиям.",
    whenToApplyEn:
      "On every rep of Tyson push-ups, during the «spring» phase (when hips drive back toward feet). Also applicable to any plyometric push-ups.",
    stepsRu: [
      "В нижней точке отжимания, когда таз уходит назад, сфокусируй внимание на ладонях.",
      "Ментально «вдавливай» ладони в пол (как будто пытаешься продавить пол насквозь).",
      "Одновременно слегка «скручивай» ладони наружу (как будто разводишь пол в стороны) — это внешняя ротация плеча.",
      "Удерживай это напряжение 1-2 секунды в фазе пружины.",
      "Взрывом выпрыгни вперёд-вверх, сохраняя напряжение в плечевом поясе до полного выпрямления рук.",
    ],
    stepsEn: [
      "At the bottom of the push-up, when hips go back, focus on your palms.",
      "Mentally «press» palms into the floor (as if trying to push through it).",
      "Simultaneously slightly «twist» palms outward (as if spreading the floor apart) — this is external shoulder rotation.",
      "Hold this tension for 1-2 seconds during the spring phase.",
      "Explosively launch forward-up, maintaining shoulder girdle tension until arms are fully extended.",
    ],
    scienceRu:
      "Внешняя ротация плеча (external rotation) активирует инфраспинатус и малую круглую мышцу (ротаторная манжета), что центрирует головку плечевой кости в суставной впадине. Это критически снижает риск импинджмент-синдрома при взрывном выталкивании. Дополнительно «вдавливание» активирует переднюю зубчатую мышцу (serratus anterior), что стабилизирует лопатку и улучшает передачу силы от кора к рукам.",
    scienceEn:
      "External shoulder rotation activates infraspinatus and teres minor (rotator cuff), centering the humeral head in the glenoid cavity. This critically reduces impingement risk during explosive pushing. Additionally, «pressing» activates serratus anterior, stabilizing the scapula and improving force transfer from core to arms.",
    level: "advanced",
    durationMin: null,
  },

  // ====== Ментальные техники: plateau, травмы, выгорание, сравнение с другими (8) ======

  // 1. Принцип индивидуальности
  {
    slug: "principle-of-individuality",
    nameRu: "Принцип индивидуальности",
    nameEn: "Principle of individuality",
    category: "mental",
    descriptionRu:
      "Осознание того, что прогресс в калистенике индивидуален: зависит от генетики, антропометрии, истории движений и восстановления. Сравнение с другими атлетами даёт ложный сигнал и не ускоряет твой путь.",
    descriptionEn:
      "Acknowledgment that calisthenics progress is individual: shaped by genetics, anthropometry, movement history and recovery. Comparing yourself to other athletes produces a false signal and does not accelerate your path.",
    whenToApplyRu:
      "При сравнении себя с другими в соцсетях или в зале, при мысли «почему у него получается, а у меня — нет», при разочаровании от чужих быстрых результатов.",
    whenToApplyEn:
      "When comparing yourself to others on social media or at the gym, when thinking «why can he and I can't», when discouraged by someone else's fast progress.",
    stepsRu: [
      "Осознай, что прогресс каждого атлета определяется его генетикой, антропометрией, историей тренировок и восстановлением — это уникальный «стартовый пакет».",
      "Сфокусируйся на своих прошлых результатах: сравни себя с собой год назад, а не с Instagram-атлетом.",
      "Заведи дневник тренировок и отмечай собственные рекорды и улучшения — твой личный baseline.",
      "Помни, что даже элитные атлеты тратят годы на освоение элементов: горизонт, передний вис, muscle-up — это сезоны, не месяцы.",
    ],
    stepsEn: [
      "Acknowledge that each athlete's progress is set by their genetics, anthropometry, training history and recovery — a unique «starter pack».",
      "Focus on your past results: compare yourself to a year ago, not to the Instagram athlete.",
      "Keep a training journal and record your own records and improvements — your personal baseline.",
      "Remember that even elite athletes spend years mastering elements: planche, front lever, muscle-up are seasons, not months.",
    ],
    scienceRu:
      "SAID principle (Specific Adaptation to Imposed Demands) утверждает, что тело адаптируется к конкретной нагрузке — но степень адаптации индивидуальна. Исследования Bouchard et al. (HERITAGE Family Study) показали вариацию до 25% в ответ на одинаковый аэробный стимул между людьми с разной генетикой. Длина конечностей, соотношение быстрых/медленных волокон, гормональный фон — всё это формирует уникальную кривую прогресса, и социальное сравнение биомеханически некорректно.",
    scienceEn:
      "The SAID principle (Specific Adaptation to Imposed Demands) states that the body adapts to the specific load — but the degree of adaptation is individual. Bouchard et al. (HERITAGE Family Study) showed variation up to 25% in response to the same aerobic stimulus between people with different genetics. Limb length, fast/slow-twitch fibre ratio, hormonal profile — all form a unique progress curve, making social comparison biomechanically invalid.",
    level: "beginner",
    durationMin: null,
  },

  // 2. Дисциплина важнее мотивации
  {
    slug: "discipline-over-motivation",
    nameRu: "Дисциплина важнее мотивации",
    nameEn: "Discipline over motivation",
    category: "mental",
    descriptionRu:
      "Перенос опоры с «хочу» на «делаю»: фиксированное расписание тренировок важнее, чем настроение в конкретный день. Мотивация приходит и уходит, дисциплина — повторяемое действие, которое не зависит от эмоционального фона.",
    descriptionEn:
      "Shifting the anchor from «want to» to «do»: a fixed training schedule matters more than your mood on a given day. Motivation comes and goes, discipline is a repeatable action independent of emotional state.",
    whenToApplyRu:
      "При потере мотивации, выгорании, мысли «не хочу сегодня», в периоды рутинной работы без быстрых результатов.",
    whenToApplyEn:
      "On losing motivation, burnout, thinking «I don't want to today», in phases of routine work without quick results.",
    stepsRu: [
      "Установи фиксированное расписание тренировок (например, Пн/Ср/Пт 18:00) — не «когда будет настроение».",
      "Готовь форму заранее с вечера: кроссовки у двери, коврик разостлан — снизь порог входа.",
      "Применяй «правило 5 минут»: начни тренировку на 5 минут, если после этого совсем не идёт — брось. В 90% случаев ты продолжишь.",
      "Отслеживай streak (подряд идущих тренировок) — визуальная цепочка в календаре мотивирует не прерывать.",
      "После тренировки фиксируй факт выполнения в дневнике — reinforce привычку.",
    ],
    stepsEn: [
      "Set a fixed training schedule (e.g. Mon/Wed/Fri 6 PM) — not «when I feel like it».",
      "Prepare your gear the night before: shoes by the door, mat unrolled — lower the entry barrier.",
      "Apply the «5-minute rule»: start training for 5 minutes, if after that it really doesn't go — quit. In 90% of cases you will continue.",
      "Track your streak (consecutive training sessions) — a visual chain in the calendar motivates you not to break it.",
      "After training, log the fact of completion in your journal — reinforce the habit.",
    ],
    scienceRu:
      "Исследования привычек (Charles Duhigg, James Clear) и B.J. Fogg (Stanford Persuasive Tech Lab) показывают, что привычка формируется через loop «cue → routine → reward». Повторение в одном контексте усиливает нейронные пути в базальных ганглиях, снижая когнитивную нагрузку и силу воли, нужную для старта. Через 21-66 дней (Lally et al., 2010) поведение становится автоматическим, и мотивация больше не нужна.",
    scienceEn:
      "Habit research (Charles Duhigg, James Clear) and B.J. Fogg (Stanford Persuasive Tech Lab) shows that a habit forms through the «cue → routine → reward» loop. Repetition in the same context strengthens neural pathways in the basal ganglia, reducing the cognitive load and willpower needed to start. After 21-66 days (Lally et al., 2010) the behaviour becomes automatic, and motivation is no longer needed.",
    level: "beginner",
    durationMin: null,
  },

  // 3. Сравнение с собой вчерашним
  {
    slug: "compare-to-past-self",
    nameRu: "Сравнение с собой вчерашним",
    nameEn: "Compare to your past self",
    category: "mental",
    descriptionRu:
      "Единственный корректный ориентир прогресса — ты сам в прошлом, а не другие атлеты в соцсетях. Instagram-сравнение всегда проигрышно, потому что показывает чужие лучшие моменты, а не их путь целиком.",
    descriptionEn:
      "The only correct benchmark for progress is your past self, not other athletes on social media. Instagram comparison always loses because it shows others' highlights, not their whole path.",
    whenToApplyRu:
      "При сравнении с другими, чувстве «я ничего не умею», после просмотра калистеник-видео в соцсетях, при демотивации.",
    whenToApplyEn:
      "When comparing yourself to others, feeling «I can't do anything», after watching calisthenics videos on social media, when demotivated.",
    stepsRu: [
      "Веди дневник тренировок — фиксируй упражнения, подходы, повторения, удержания и субъективные ощущения.",
      "Раз в месяц перечитывай записи за полгода — заметишь прогресс, который в моменте не виден.",
      "Отмечай конкретные улучшения: +1 повторение, +2 секунды удержания, новый элемент — даже мелкие.",
      "Празднуй микро-победы: отмечай их так же, как крупные достижения.",
    ],
    stepsEn: [
      "Keep a training journal — log exercises, sets, reps, holds and subjective sensations.",
      "Once a month reread entries from six months ago — you will notice progress invisible in the moment.",
      "Mark concrete improvements: +1 rep, +2 seconds of hold, a new element — even small ones.",
      "Celebrate micro-victories: treat them as legitimate wins, same as major achievements.",
    ],
    scienceRu:
      "Теория социального сравнения (Festinger, 1954) утверждает, что люди оценивают себя через сравнение с другими — но в эпоху соцсетей это сравнение искажено: мы видим curated highlights, а не реальность. Исследования Kross et al. (University of Michigan, 2013) показали, что пассивное потребление Facebook/Instagram снижает субъективное благополучие и удовлетворённость жизнью. Сравнение с собой прошлым — это upward comparison с реалистичной базой, а не с недостижимым идеалом.",
    scienceEn:
      "Social comparison theory (Festinger, 1954) holds that people evaluate themselves through comparison with others — but in the social media era this comparison is distorted: we see curated highlights, not reality. Kross et al. (University of Michigan, 2013) showed that passive Facebook/Instagram consumption lowers subjective well-being and life satisfaction. Comparison with your past self is upward comparison with a realistic baseline, not an unattainable ideal.",
    level: "beginner",
    durationMin: null,
  },

  // 4. Принцип 5 лет терпения
  {
    slug: "five-years-patience",
    nameRu: "Принцип 5 лет терпения",
    nameEn: "Five-year patience principle",
    category: "mental",
    descriptionRu:
      "Реалистичный горизонт освоения продвинутых элементов калистеники: горизонт, передний вис, muscle-up, стойка на руках — это годы, не месяцы. Установка на 3-5 лет меняет восприятие промежуточных plateau с «не получается» на «ещё не дошёл».",
    descriptionEn:
      "A realistic horizon for mastering advanced calisthenics elements: planche, front lever, muscle-up, handstand are years, not months. Setting a 3-5 year horizon reframes intermediate plateaus from «I can't» to «I haven't arrived yet».",
    whenToApplyRu:
      "При разочаровании от медленного прогресса, после месяца без видимых улучшений, при мысли «уже полгода тренируюсь, а переднего виса нет».",
    whenToApplyEn:
      "On discouragement from slow progress, after a month without visible improvements, thinking «I've been training for half a year and still no front lever».",
    stepsRu: [
      "Поставь долгосрочную цель (3-5 лет): например, чистый передний вис за 3 года, горизонт за 5.",
      "Разбей путь на годовые milestone'ы: первый год — tuck, второй — advanced tuck, третий — one leg.",
      "Празднуй промежуточные достижения: каждый новый шаг прогрессии — это легитимная победа.",
      "Помни математику сложного процента: 1% улучшения в день = x37 за год (исключительная идеализация, но иллюстрирует силу регулярности).",
    ],
    stepsEn: [
      "Set a long-term goal (3-5 years): e.g. clean front lever in 3 years, planche in 5.",
      "Break the path into yearly milestones: year one — tuck, year two — advanced tuck, year three — one leg.",
      "Celebrate intermediate achievements: each new progression step is a legitimate victory.",
      "Remember compound interest math: 1% improvement per day = x37 in a year (an exceptional idealisation, but illustrates the power of regularity).",
    ],
    scienceRu:
      "Ericsson (1993) оценил время достижения экспертного уровня в ~10000 часов осознанной практики — цифра спорная, но для элитного уровня калистеники (front lever, planche) порядок верен: годы, не месяцы. Закон diminishing returns: первые улучшения идут быстро (новичок растёт за недели), потом прогресс замедляется, и plateau на каждом новом уровне — норма, а не сбой. Кривая обучения обычно S-образная: плато → прорыв → новое плато.",
    scienceEn:
      "Ericsson (1993) estimated the time to reach expert level at ~10,000 hours of deliberate practice — the number is debated, but for elite-level calisthenics (front lever, planche) the order is correct: years, not months. The law of diminishing returns: early improvements come quickly (a beginner grows in weeks), then progress slows, and a plateau at each new level is the norm, not a failure. The learning curve is typically S-shaped: plateau → breakthrough → new plateau.",
    level: "intermediate",
    durationMin: null,
  },

  // 5. Отвязка эго от результатов
  {
    slug: "ego-detachment",
    nameRu: "Отвязка эго от результатов",
    nameEn: "Ego detachment from results",
    category: "mental",
    descriptionRu:
      "Разделение «я как человек» и «я как атлет»: не получилось сделать элемент — это не делает тебя менее ценным. Самооценка, привязанная к спортивным результатам, превращает каждую неудачу в личную катастрофу.",
    descriptionEn:
      "Separating «myself as a person» from «myself as an athlete»: failing an element does not make you less valuable. Self-esteem tied to athletic results turns every failure into a personal catastrophe.",
    whenToApplyRu:
      "При неудачах, не получился элемент, мысль «я не могу», после проваленной попытки на тренировке или соревнованиях.",
    whenToApplyEn:
      "On failures, a missed element, thinking «I can't», after a failed attempt in training or competition.",
    stepsRu: [
      "Раздели идентичности: «я как человек» (ценность не зависит от спорта) и «я как атлет» (это роль, не вся личность).",
      "Помни, что тренировки — это часть жизни, а не вся жизнь: есть работа, отношения, друзья, интересы вне спорта.",
      "Используй формулировку «у меня пока не получается X» вместо «я не умею X» — это ставит неудачу во времени, а не в идентичности.",
      "Найди опору вне спорта: хобби, отношения, творчество, профессия — что-то, что не падает вместе с тренировочным срывом.",
    ],
    stepsEn: [
      "Separate identities: «myself as a person» (value does not depend on sport) and «myself as an athlete» (this is a role, not the whole personality).",
      "Remember that training is part of life, not all of it: there is work, relationships, friends, interests outside sport.",
      "Use the phrasing «I can't do X yet» instead of «I can't do X» — this places failure in time, not in identity.",
      "Find an anchor outside sport: hobbies, relationships, creativity, profession — something that does not collapse with a training slump.",
    ],
    scienceRu:
      "Исследования self-compassion (Kristin Neff, 2003+) и Acceptance and Commitment Therapy (Hayes, 1999) показывают, что привязка самооценки к внешним результатам (performance-based self-esteem) коррелирует с тревожностью, депрессией и выгоранием (Hallsten et al., 2002). Разделение performance-identity и self-identity — это защитный механизм: спортивные неудачи перестают угрожать базовому чувству собственной ценности.",
    scienceEn:
      "Self-compassion research (Kristin Neff, 2003+) and Acceptance and Commitment Therapy (Hayes, 1999) show that tying self-worth to external results (performance-based self-esteem) correlates with anxiety, depression and burnout (Hallsten et al., 2002). Separating performance-identity from self-identity is a protective mechanism: athletic failures stop threatening the basic sense of self-worth.",
    level: "intermediate",
    durationMin: null,
  },

  // 6. Микро-победы
  {
    slug: "micro-victories",
    nameRu: "Микро-победы",
    nameEn: "Micro-victories",
    category: "mental",
    descriptionRu:
      "Сознательное празднование маленьких шагов прогресса: +1 повторение, +2 секунды удержания, новая подводящая прогрессия — это легитимные победы, а не «мелочь». Игнорирование микро-побед обнуляет мотивацию на длинной дистанции.",
    descriptionEn:
      "Consciously celebrating small steps of progress: +1 rep, +2 seconds of hold, a new progression step — these are legitimate victories, not «trivia». Ignoring micro-victories kills motivation on the long distance.",
    whenToApplyRu:
      "При ощущении застоя (plateau), для поддержания мотивации между большими достижениями, в длительных фазах прогресса.",
    whenToApplyEn:
      "On feeling plateaued, to maintain motivation between big achievements, in long progress phases.",
    stepsRu: [
      "Ставь микро-цель на каждую тренировку: одно конкретное улучшение (например, +1 повторение в подходе).",
      "Записывай даже маленькие достижения в дневник: «сегодня держал L-sit на 3 секунды дольше».",
      "Награждай себя за микро-победы: любимой едой, просмотром сериала, прогулкой — закрепляй мозгом связь «усилие → награда».",
      "Веди «журнал побед»: отдельный список только микро-достижений, перечитывай в трудные дни.",
    ],
    stepsEn: [
      "Set a micro-goal for each session: one concrete improvement (e.g. +1 rep in a set).",
      "Record even small achievements in the journal: «today I held the L-sit 3 seconds longer».",
      "Reward yourself for micro-victories: favourite food, a TV show, a walk — wire the brain's «effort → reward» link.",
      "Keep a «victory journal»: a separate list of only micro-achievements, reread on hard days.",
    ],
    scienceRu:
      "Dopamine reward system (Wolfram Schultz) — дофамин выделяется не на саму награду, а на предвкушение и распознавание прогресса к ней. Исследования геймификации (Sebastian Deterding) и progress principle (Teresa Amabile, Harvard, 2011) показывают, что фиксация даже малых ежедневных продвижений — сильнейший предиктор мотивации и продуктивности, выше крупных редких побед. Мозг работает на маленьких дофаминовых циклах, а не на редких больших.",
    scienceEn:
      "The dopamine reward system (Wolfram Schultz) — dopamine is released not for the reward itself, but in anticipation and recognition of progress toward it. Gamification research (Sebastian Deterding) and the progress principle (Teresa Amabile, Harvard, 2011) show that fixing even small daily advances is the strongest predictor of motivation and productivity, above large rare wins. The brain runs on small dopamine loops, not rare big ones.",
    level: "beginner",
    durationMin: null,
  },

  // 7. Дневник прогресса
  {
    slug: "progress-journal",
    nameRu: "Дневник прогресса",
    nameEn: "Progress journal",
    category: "mental",
    descriptionRu:
      "Систематическое ведение журнала тренировок: что делал, как себя чувствовал, что получилось, что нет. Не только фиксация, но и анализ паттернов для корректировки программы.",
    descriptionEn:
      "Systematic keeping of a training journal: what you did, how you felt, what worked, what didn't. Not only recording, but also analysing patterns to adjust the program.",
    whenToApplyRu:
      "Всегда — 5 минут после каждой тренировки. Особенно важно при plateau, при отсутствии видимого прогресса, при планировании новых циклов.",
    whenToApplyEn:
      "Always — 5 minutes after each session. Especially important on plateaus, with no visible progress, when planning new cycles.",
    stepsRu: [
      "Сразу после тренировки запиши: упражнения, подходы, повторения, удержания, субъективное состояние (сон, усталость, настроение).",
      "Отмечай что получилось хорошо, что не получилось, какие были болезненные сигналы.",
      "Раз в неделю перечитывай записи — ищи паттерны: какие объёмы ведут к росту, какие — к перетренированности.",
      "Корректируй программу на основе анализа: если 2 недели нет прогресса по конкретному элементу — меняй стимул.",
    ],
    stepsEn: [
      "Right after training, record: exercises, sets, reps, holds, subjective state (sleep, fatigue, mood).",
      "Note what went well, what didn't, what painful signals appeared.",
      "Once a week reread the entries — look for patterns: which volumes drive growth, which drive overtraining.",
      "Adjust the program based on the analysis: if 2 weeks have no progress on a specific element — change the stimulus.",
    ],
    scienceRu:
      "Expressive writing research (Pennebaker, 1997) показала, что структурированное записывание опыта снижает стресс и улучшает саморегуляцию. Self-monitoring — поведенческая техника (Kanfer, 1970); мета-анализы (Korotitsch & Nelson-Gray, 1999) показывают прирост эффективности на 20-30% при самостоятельной записи поведения и результатов. Осознание паттернов невозможно без фиксации — память субъективна и подвержена искажениям.",
    scienceEn:
      "Expressive writing research (Pennebaker, 1997) showed that structured writing of experience reduces stress and improves self-regulation. Self-monitoring is a behavioural technique (Kanfer, 1970); meta-analyses (Korotitsch & Nelson-Gray, 1999) show a 20-30% gain in effectiveness from self-recording behaviour and outcomes. Awareness of patterns is impossible without fixation — memory is subjective and prone to distortion.",
    level: "beginner",
    durationMin: 5,
  },

  // 8. Самосострадание при неудачах
  {
    slug: "self-compassion-in-failure",
    nameRu: "Самосострадание при неудачах",
    nameEn: "Self-compassion in failure",
    category: "mental",
    descriptionRu:
      "При неудаче (не получился элемент, пропустил тренировки, получил травму) не ругай себя. Относись к себе как к другу, который столкнулся с трудностью — с поддержкой, а не критикой.",
    descriptionEn:
      "On failure (a missed element, skipped training, an injury) do not berate yourself. Treat yourself as you would a friend who ran into difficulty — with support, not criticism.",
    whenToApplyRu:
      "При травмах, не получился элемент после долгой подготовки, пропустил серию тренировок, при чувстве вины за лень или слабость.",
    whenToApplyEn:
      "On injuries, a missed element after long preparation, a skipped streak of sessions, on guilt for laziness or weakness.",
    stepsRu: [
      "Останови внутреннего критика: заметив самокритику («я лох», «у меня ничего не получается»), сознательно прерви этот внутренний монолог.",
      "Скажи себе: «это нормально — сталкиваться с трудностями, через это проходят все атлеты».",
      "Вспомни, что каждая травма и каждое plateau — это часть пути, а не исключение из него. Неудачи у всех.",
      "Поставь реалистичный план восстановления или возврата: малые шаги, без попыток «наверстать упущенное за одну тренировку».",
    ],
    stepsEn: [
      "Stop the inner critic: noticing self-criticism («I'm a loser», «I can't do anything»), consciously interrupt the inner monologue.",
      "Tell yourself: «it's normal to face difficulties, every athlete goes through it».",
      "Remember that every injury and every plateau is part of the path, not an exception to it. Failures happen to everyone.",
      "Set a realistic recovery or return plan: small steps, without trying to «make up for lost time in one session».",
    ],
    scienceRu:
      "Kristin Neff (2003+) — ведущий исследователь self-compassion; конструкт состоит из 3 компонентов: self-kindness (vs. self-judgment), common humanity (vs. isolation), mindfulness (vs. over-identification). Мета-анализ MacBeth & Gumley (2012, n=20 studies) показал устойчивую связь self-compassion с меньшей тревожностью (r ≈ −0.54), депрессией (r ≈ −0.50) и большим resilience. В спортивной психологии (Ferguson et al., 2014) self-compassion предсказывает более быстрое восстановление после неудач и меньший fear of failure.",
    scienceEn:
      "Kristin Neff (2003+) is the leading researcher of self-compassion; the construct consists of 3 components: self-kindness (vs. self-judgment), common humanity (vs. isolation), mindfulness (vs. over-identification). The MacBeth & Gumley meta-analysis (2012, n=20 studies) showed a stable link of self-compassion with lower anxiety (r ≈ −0.54), depression (r ≈ −0.50) and higher resilience. In sport psychology (Ferguson et al., 2014) self-compassion predicts faster recovery from failure and lower fear of failure.",
    level: "intermediate",
    durationMin: null,
  },
];

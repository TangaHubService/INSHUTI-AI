// Seed content below is AI-drafted for local development and demos so the
// chat has real material to retrieve from day one. It is NOT clinically
// reviewed. It's marked REVIEWED anyway (see reviewedBy below) purely so
// retrieval is exercisable immediately — real deployments must have every
// one of these articles re-reviewed and re-approved by a licensed health
// professional via the admin panel (Phase 4) before real users see them.
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";

import { adminRoleSchema, articleStatusSchema } from "../src/lib/constants.js";
import { encodeJsonColumn } from "../src/lib/jsonColumn.js";
import { prisma } from "../src/lib/prisma.js";

const SUPER_ADMIN = adminRoleSchema.enum.SUPER_ADMIN;
const REVIEWED = articleStatusSchema.enum.REVIEWED;

// icon/colorToken match the SVG symbol ids and CSS color tokens already used
// in the design prototype ( test-g/index.html topic cards), so Phase 3 can
// wire these up without renaming anything.
const TOPICS = [
  {
    slug: "menstrual-health",
    nameEn: "Menstrual Health",
    nameRw: "Ubuzima bw'Imihango",
    icon: "i-droplet",
    colorToken: "coral",
    articles: [
      {
        titleEn: "What is a normal menstrual cycle?",
        titleRw: "Umuzunguruko usanzwe w'imihango ni uwuhe?",
        bodyEn:
          "A menstrual cycle usually lasts between 21 and 35 days, counted from the first day of one period to the first day of the next. Bleeding itself typically lasts 2 to 7 days. Cycle length can vary from month to month, especially in the first few years after periods start, and that is normal. If your periods are extremely irregular, very painful, or stop for several months without pregnancy, it's worth talking to a health worker.",
        bodyRw:
          "Umuzunguruko w'imihango usanzwe umara hagati y'iminsi 21 na 35, ubarwa uhereye ku munsi wa mbere w'imihango ukageza ku munsi wa mbere w'ayindi mihango. Kuva amaraso bisanzwe bimara iminsi 2 kugeza kuri 7. Uburebure bw'umuzunguruko burashobora guhinduka buri kwezi, cyane cyane mu myaka ya mbere imihango itangiye, kandi ibyo ni ibisanzwe. Niba imihango yawe idahoraho cyane, ibabaza cyane, cyangwa ihagarara amezi menshi utaratwite, byaba byiza uganira n'umukozi w'ubuzima.",
        tags: ["period", "cycle", "menstruation", "menstrual health"],
      },
      {
        titleEn: "Managing period pain",
        titleRw: "Gucunga ububabare bw'imihango",
        bodyEn:
          "Mild cramping in the lower belly or back during your period is common and caused by the uterus contracting. A warm compress, gentle movement, staying hydrated, and rest can all help. Over-the-counter pain relief can also ease cramps when used as directed. If pain is severe enough to stop your daily activities, or gets worse over time, that's a good reason to see a health worker rather than just manage it alone.",
        bodyRw:
          "Kubabara gato mu nda yo hasi cyangwa mu mugongo mu gihe cy'imihango ni ibisanzwe kandi biterwa n'infuka y'inda yifunga. Gushyira igicucu gishyushye, kunyeganyega buhoro, kunywa amazi ahagije, no kuruhuka bifasha. Imiti ifasha kubabara igurwa idasabwa na muganga irashobora no gufasha, iyo ikoreshejwe uko byagenwe. Niba ububabare bukomeye ku buryo bukubuza gukora ibikorwa byawe bya buri munsi, cyangwa bugenda burushaho kwiyongera, ni impamvu yo kubona umukozi w'ubuzima aho kubyihanganira wenyine.",
        tags: ["period pain", "cramps", "menstruation"],
      },
      {
        titleEn: "Period hygiene basics",
        titleRw: "Isuku mu gihe cy'imihango",
        bodyEn:
          "Change your pad, tampon, or menstrual cup regularly — roughly every 4 to 8 hours depending on the product and your flow — to stay comfortable and reduce infection risk. Washing your hands before and after changing products, and washing the genital area with water (soap is optional and mild if used), is enough; you don't need special products to feel clean. Any clean cloth, pad, or product you have access to is okay to use.",
        bodyRw:
          "Hindura agakoti, tampon, cyangwa igikombe cy'imihango buri masaha 4 kugeza kuri 8 bitewe n'ikoresho ukoresha n'uko amaraso agenda, kugira ngo wumve umeze neza kandi ugabanye ibyago by'indwara. Gukaraba intoki mbere no nyuma yo guhindura ibikoresho, no gukaraba mu gice cy'imyanya ndangagitsina ukoresheje amazi (isabune ni ukubishaka, ukoresha imwe yoroheje) birahagije; nta bikoresho bidasanzwe ukeneye kugira ngo wiyumve uri musukuye. Icyapa cyose gisukuye ufite wagikoresha.",
        tags: ["hygiene", "menstruation", "self care"],
      },
    ],
  },
  {
    slug: "pregnancy",
    nameEn: "Pregnancy",
    nameRw: "Gutwita",
    icon: "i-baby",
    colorToken: "gold",
    articles: [
      {
        titleEn: "Early signs of pregnancy",
        titleRw: "Ibimenyetso bya mbere by'inda",
        bodyEn:
          "A missed period is often the first sign someone notices, along with nausea, breast tenderness, tiredness, or needing to urinate more often. None of these on their own confirm pregnancy — the only reliable way to know is a pregnancy test, which works best a few days after a missed period. If a test is positive, seeing a health worker early helps you understand your options and start any care you need.",
        bodyRw:
          "Kutabona imihango akenshi ni ikimenyetso cya mbere umuntu yibonera, hamwe no kwiyumva ureba kunywera, kubabara amabere, umunaniro, cyangwa kwiyambaza inshuro nyinshi. Nta na kimwe muri ibi cyonyine gihamya inda — uburyo bwonyine bwizewe ni ikizamini cy'inda, gikora neza nyuma y'iminsi mike imihango itaje. Niba ikizamini kigaragaje ko utwite, kubona umukozi w'ubuzima hakiri kare bigufasha gusobanukirwa amahitamo yawe no gutangira ubuvuzi ukeneye.",
        tags: ["pregnancy signs", "pregnancy test"],
      },
      {
        titleEn: "Can I get pregnant during my period?",
        titleRw: "Nshobora gutwita ngiri mu mihango?",
        bodyEn:
          "Pregnancy during your period itself is less likely but not impossible, especially if your cycle is short or irregular, because sperm can survive in the body for several days and ovulation timing varies. If you are sexually active and not trying to become pregnant, using contraception consistently — not just avoiding sex during your period — is the reliable way to prevent pregnancy. A health worker can help you find a method that fits your life.",
        bodyRw:
          "Gutwita ngiri mu mihango ntibisanzwe ariko ntibishoboka rwose kutabaho, cyane cyane niba umuzunguruko wawe muto cyangwa udahoraho, kubera ko intanga z'umugabo zishobora kubaho mu mubiri iminsi myinshi kandi igihe cyo gutera amagi kigenda gihinduka. Niba ukorana imibonano mpuzabitsina kandi utifuza gutwita, gukoresha uburyo bwo kwirinda inda mu buryo buhoraho — atari ukwirinda imibonano mu gihe cy'imihango gusa — ni bwo buryo bwizewe bwo kwirinda inda. Umukozi w'ubuzima arashobora kugufasha kubona uburyo buhuye n'ubuzima bwawe.",
        tags: ["pregnancy", "period", "ovulation"],
      },
      {
        titleEn: "When to see a health worker about pregnancy",
        titleRw: "Ni ryari ugomba kubona umukozi w'ubuzima ku byerekeye inda",
        bodyEn:
          "Whether you think you might be pregnant, want to plan for pregnancy, or are trying to avoid it, a health worker can support you without judgment. Early prenatal care — ideally starting in the first trimester — helps catch and manage issues early for a healthier pregnancy. You have the right to ask questions and get clear answers about your body and your options at any stage.",
        bodyRw:
          "Waba utekereza ko utwite, ushaka gutegura gutwita, cyangwa ushaka kwirinda gutwita, umukozi w'ubuzima arashobora kugufasha nta kugucira urubanza. Kwitabwaho hakiri kare mu gihe cy'inda — byaba byiza bitangiye mu mezi atatu ya mbere — bifasha kumenya no gucunga ibibazo hakiri kare kugira ngo inda igende neza. Ufite uburenganzira bwo kubaza ibibazo no kubona ibisubizo bisobanutse ku byerekeye umubiri wawe n'amahitamo yawe mu gihe cyose.",
        tags: ["prenatal care", "pregnancy", "health worker"],
      },
    ],
  },
  {
    slug: "relationships",
    nameEn: "Relationships",
    nameRw: "Imibanire",
    icon: "i-heart",
    colorToken: "teal",
    articles: [
      {
        titleEn: "What makes a relationship healthy?",
        titleRw: "Ibigize imibanire myiza",
        bodyEn:
          "Healthy relationships are built on respect, honesty, trust, and both people feeling free to say no. You should feel able to share your opinions, spend time with friends and family, and make your own decisions without fear. Disagreements are normal, but they should be handled without threats, put-downs, or control. If a relationship makes you feel small or afraid, that's worth talking through with someone you trust.",
        bodyRw:
          "Imibanire myiza yubakwa ku kwubahana, ukuri, kwizerana, n'uko abantu bombi biyumva bafite umudendezo wo kuvuga oya. Ugomba kwiyumva ushobora kuvuga ibitekerezo byawe, gusangira igihe n'inshuti n'umuryango, no gufata ibyemezo byawe udatinya. Kutumvikana ni ibisanzwe, ariko bigomba gukemurwa nta guhungabanya, kwikanga, cyangwa kugenzura undi. Niba imibanire igutera kwiyumva uri muto cyangwa gutinya, ni byiza kubivugana n'umuntu wizeye.",
        tags: ["relationships", "healthy relationship", "respect"],
      },
      {
        titleEn: "Recognizing pressure or coercion",
        titleRw: "Kumenya igihe bakubangamiye cyangwa bakwongorera",
        bodyEn:
          "Pressure to do something sexual — through guilt, repeated asking, threats, or making you feel you owe someone — is not consent, even in a relationship. Real consent is freely given, can be withdrawn at any time, and isn't the result of fear or manipulation. If someone pressures you, it is not your fault, and you deserve support. Talking to a trusted adult, counselor, or health worker is a safe next step.",
        bodyRw:
          "Kubangamira umuntu ngo akore ikintu cy'imibonano mpuzabitsina — binyuze mu kumushinja icyaha, kubaza kenshi, guhahamura, cyangwa kumutera kwiyumva ko afitiye undi umwenda — ntibisobanura ko yemeye. Kwemera nyakuri ni ukwitanga ku bushake, gushobora gukurwaho igihe icyo ari cyo cyose, kandi ntibiterwa n'ubwoba cyangwa uburiganya. Niba hari ubangamiye, si icyaha cyawe, kandi ukwiye gufashwa. Kuvugana n'umuntu mukuru wizeye, umujyanama, cyangwa umukozi w'ubuzima ni intambwe yizewe ikurikiraho.",
        tags: ["consent", "coercion", "safety"],
      },
      {
        titleEn: "Talking to a partner about boundaries",
        titleRw: "Kuganira na mugenzi wawe ku mipaka yawe",
        bodyEn:
          "Setting a boundary means clearly saying what you are and aren't comfortable with, before or during a situation. It helps to be direct and calm — for example, naming exactly what you want to happen instead. A partner who respects you will listen and adjust, even if they're disappointed. Boundaries can also change over time, and you're allowed to update them whenever you need to.",
        bodyRw:
          "Gushyiraho umupaka bisobanura kuvuga mu buryo busobanutse ibyo wumva byakwiye n'ibyo utabyumva neza, mbere cyangwa mu gihe cy'ikintu kibaye. Bifasha kuvuga mu buryo butaziguye kandi utuje — urugero, kuvuga neza icyo ushaka ko gikorwa aho kuba ikindi. Umufasha wagushyigikiye azumva akanahindura imyitwarire ye, n'iyo yaba yababaye. Imipaka nayo irashobora guhinduka mu gihe, kandi wemerewe kuyihindura igihe icyo ari cyo cyose ukeneye.",
        tags: ["boundaries", "communication", "relationships"],
      },
    ],
  },
  {
    slug: "family-planning",
    nameEn: "Family Planning",
    nameRw: "Kuboneza Urubyaro",
    icon: "i-pill",
    colorToken: "coral",
    articles: [
      {
        titleEn: "Overview of contraception methods",
        titleRw: "Incamake y'uburyo bwo kuboneza urubyaro",
        bodyEn:
          "There are several types of contraception: barrier methods like condoms, hormonal methods like pills, injections, or implants, long-acting methods like IUDs, and permanent methods. Each has different effectiveness, side effects, and how often you need to think about it. Condoms are the only method that also helps protect against HIV and other STIs. A health worker can walk you through what fits your health, plans, and lifestyle.",
        bodyRw:
          "Hari ubwoko butandukanye bwo kuboneza urubyaro: uburyo bwo kubuza nk'udukingirizo, uburyo bwifashisha imisemburo nk'ibinini, urushinge, cyangwa akapira kashyirwa mu kuboko, uburyo bumara igihe kirekire nka IUD, n'uburyo buhoraho. Buri bwoko bufite ubushobozi butandukanye, ingaruka zitandukanye, n'uko ugomba kubwibuka kenshi bitandukanye. Udukingirizo ni bwo buryo bwonyine bufasha no kwirinda ubwandu bwa virusi itera SIDA n'izindi ndwara zandurira mu mibonano mpuzabitsina. Umukozi w'ubuzima arashobora kugufasha kubona ubwiza buhuye n'ubuzima, imigambi, n'imibereho yawe.",
        tags: ["contraception", "family planning", "birth control"],
      },
      {
        titleEn: "Where to get family planning services",
        titleRw: "Aho ubona serivisi zo kuboneza urubyaro",
        bodyEn:
          "Public health centers and hospitals across Rwanda offer family planning counseling and methods, often at low or no cost. Community health workers can also connect you to services closer to home. You don't need permission from a partner or parent to ask questions or seek information about your options, though a health worker can talk through what's involved for the method you choose.",
        bodyRw:
          "Ibigo nderabuzima n'amavuriro ya Leta hirya no hino mu Rwanda batanga inama n'uburyo bwo kuboneza urubyaro, akenshi ku giciro gito cyangwa nta kiguzi. Abajyanama b'ubuzima bo mu baturage barashobora nabo kukwerekeza aho serivisi ziri hafi yawe. Nta ruhusa ukeneye kubwa mugenzi wawe cyangwa umubyeyi kugira ngo ubaze ibibazo cyangwa ushake amakuru ku mahitamo yawe, nubwo umukozi w'ubuzima yagusobanurira icyo uburyo wahisemo busaba.",
        tags: ["family planning", "health services", "access"],
      },
      {
        titleEn: "Common myths about contraception",
        titleRw: "Ibitekerezo bitari byo ku kuboneza urubyaro",
        bodyEn:
          "Contraception does not cause infertility — most methods stop working as soon as you stop using them, and fertility returns close to normal timelines afterward. It's also a myth that you must have already had a child to use contraception safely. Different methods suit different people, so if one causes side effects that bother you, that doesn't mean all methods will — a health worker can help you try another option.",
        bodyRw:
          "Kuboneza urubyaro ntibitera ubugumba — uburyo bwinshi buhita buta agaciro igihe uretse kubukoresha, kandi ubushobozi bwo kubyara bugaruka mu gihe gisanzwe nyuma. Ni na ikinyoma ko ugomba kuba warabyaye kugira ngo ukoreshe uburyo bwo kuboneza urubyaro mu mutekano. Uburyo butandukanye buhuye n'abantu batandukanye, bityo niba bumwe butera ingaruka zikubabaza, ntibisobanura ko ubundi bwose buzagira ingaruka zimwe — umukozi w'ubuzima arashobora kugufasha kugerageza ubundi buryo.",
        tags: ["contraception", "myths", "family planning"],
      },
    ],
  },
  {
    slug: "hiv-stis",
    nameEn: "HIV & STIs",
    nameRw: "Virusi itera SIDA n'izindi Ndwara Zandurira mu Mibonano",
    icon: "i-shield",
    colorToken: "teal",
    articles: [
      {
        titleEn: "How HIV is and isn't transmitted",
        titleRw: "Uko virusi itera SIDA yandura n'uko itandura",
        bodyEn:
          "HIV spreads through specific body fluids — blood, semen, vaginal fluids, and breast milk — mainly through unprotected sex, sharing needles, or from parent to child during pregnancy or birth. It does not spread through casual contact like hugging, sharing food, or using the same toilet. Using condoms correctly and getting tested regularly are the most reliable ways to protect yourself and know your status.",
        bodyRw:
          "Virusi itera SIDA yandura binyuze mu maraso, amazi y'imbeba y'umugabo, amazi yo mu gitsina cy'umugore, n'amashereka, cyane cyane binyuze mu mibonano mpuzabitsina idakingiwe, gusangira inshinge, cyangwa kuva ku mubyeyi ujya ku mwana mu gihe cy'inda cyangwa kubyara. Ntiyandura binyuze mu guhoberana, gusangira ibiryo, cyangwa gukoresha ubwiherero rimwe. Gukoresha udukingirizo neza no gupimwa kenshi ni bwo buryo bwizewe cyane bwo kwirinda no kumenya uko uri.",
        tags: ["hiv", "transmission", "sti"],
      },
      {
        titleEn: "Getting tested for HIV and STIs",
        titleRw: "Gupimwa virusi itera SIDA n'izindi ndwara zandurira mu mibonano",
        bodyEn:
          "Testing is quick, often free at public health centers, and results are kept confidential. Many STIs, including HIV, don't cause obvious symptoms at first, so testing is the only way to know for sure. If you're sexually active, regular testing — even without symptoms — is a normal part of taking care of your health, not a sign that something is wrong.",
        bodyRw:
          "Gupimwa birihuse, akenshi ni ubuntu mu bigo nderabuzima bya Leta, kandi ibisubizo bibikwa mu ibanga. Indwara nyinshi zandurira mu mibonano, harimo na virusi itera SIDA, ntizigaragaza ibimenyetso bigaragara mu ntangiriro, bityo gupimwa ni bwo buryo bwonyine bwo kumenya neza. Niba ukorana imibonano mpuzabitsina, gupimwa kenshi — n'igihe utagira ibimenyetso — ni igice gisanzwe cyo kwita ku buzima bwawe, ntabwo ari ikimenyetso cy'uko hari ikibazo.",
        tags: ["testing", "hiv", "sti"],
      },
      {
        titleEn: "Using condoms correctly",
        titleRw: "Gukoresha udukingirizo neza",
        bodyEn:
          "Check the expiry date and package for damage before use, and open the wrapper carefully to avoid tearing the condom. Pinch the tip to leave space for semen, roll it on fully before any genital contact, and use a new condom every time and for every act. After use, hold the base while withdrawing and dispose of it — never reuse a condom. Water- or silicone-based lubricant can help prevent breakage; avoid oil-based products with latex condoms.",
        bodyRw:
          "Reba itariki y'irangira n'uko agakoni katameze nabi mbere yo gukoresha, hanyuma ufungure agakoni witonze kugira ngo utamena agakingirizo. Fata umutwe wako ukarekera umwanya w'intanga, ukanambara neza mbere y'uko hagira ikigira uruhande rw'imyanya ndangagitsina rukorana, kandi ukoreshe agakingirizo gashya buri gihe kandi kuri buri mibonano. Nyuma yo gukoresha, fata ikibindi mu gihe ukuramo, hanyuma ukajugunye — ntukigere wongera gukoresha agakingirizo. Amavuta yifashisha amazi cyangwa silicone yafasha kwirinda gucika; wirinde amavuta y'amavuta n'agakingirizo ka latex.",
        tags: ["condoms", "protection", "sti"],
      },
    ],
  },
  {
    slug: "mental-health",
    nameEn: "Mental Health",
    nameRw: "Ubuzima bwo mu Mutwe",
    icon: "i-mind",
    colorToken: "gold",
    articles: [
      {
        titleEn: "Coping with stress and anxiety",
        titleRw: "Kwihangana ku mihangayiko n'ubwoba",
        bodyEn:
          "Everyone feels stressed or anxious sometimes — it's a normal response, not a weakness. Simple things can help in the moment: slow breathing, naming what you're feeling, moving your body, or talking to someone you trust. Regular sleep, eating, and limiting caffeine can also make a real difference over time. If stress or worry starts interfering with school, sleep, or relationships most days, it's worth speaking with a counselor or health worker.",
        bodyRw:
          "Buri wese arumva ahangayitse cyangwa afite ubwoba rimwe na rimwe — ibyo ni ibisanzwe, si intege nke. Ibintu byoroshye birashobora gufasha muri icyo gihe: guhumeka buhoro, kuvuga icyo wiyumva, kwimuka umubiri wawe, cyangwa kuvugana n'umuntu wizeye. Gusinzira neza, kurya neza, no kugabanya ibinyobwa birimo cafeine nabyo birafasha mu gihe kirekire. Niba umuhangayiko utangiye kubangamira amasomo, ibitotsi, cyangwa imibanire yawe iminsi myinshi, byaba byiza kuvugana n'umujyanama cyangwa umukozi w'ubuzima.",
        tags: ["stress", "anxiety", "coping"],
      },
      {
        titleEn: "When sadness might be depression",
        titleRw: "Igihe agahinda gashobora kuba ari indwara y'agahinda",
        bodyEn:
          "Feeling sad after a hard day is normal, but depression is different: it's a low mood, loss of interest in things you used to enjoy, changes in sleep or appetite, or low energy that lasts most of the day, nearly every day, for two weeks or more. Depression is a real health condition, not a personal failure, and it's treatable. If this sounds like you, reaching out to a counselor or health worker is a strong, not weak, thing to do.",
        bodyRw:
          "Kwiyumva ubabaye nyuma y'umunsi ugoye ni ibisanzwe, ariko indwara y'agahinda itandukanye: ni uguhora umutima muremure, guta amatsiko mu bintu wahoze ukunda, guhinduka kw'ibitotsi cyangwa uburyo bwo kurya, cyangwa kubura imbaraga bimara igice kinini cy'umunsi, hafi buri munsi, mu byumweru bibiri cyangwa birenga. Indwara y'agahinda ni indwara nyayo, ntabwo ari ikinyoma cyangwa intege nke, kandi irakizwa. Niba ibi bikwerekeranye, kuvugana n'umujyanama cyangwa umukozi w'ubuzima ni igikorwa cy'imbaraga, ntabwo ari intege nke.",
        tags: ["depression", "mental health", "mood"],
      },
      {
        titleEn: "How to support a friend who is struggling",
        titleRw: "Uko wafasha inshuti igoswe n'ibibazo",
        bodyEn:
          "You don't need to have the answers — often, listening without judging or trying to immediately fix things is the most helpful thing you can do. Let them know you're there, ask open questions like \"how are you really doing?\", and take mentions of hopelessness or self-harm seriously rather than dismissing them. Encourage them to talk to a trusted adult or health worker, and if you're worried about their immediate safety, don't leave them alone — get another trusted adult involved right away.",
        bodyRw:
          "Ntugomba kuba ufite ibisubizo — akenshi, kumva nta gucira urubanza cyangwa kugerageza gukemura ibintu ako kanya ni cyo gikorwa gifasha kurusha ibindi. Mumenyeshe ko uri hafi yabo, babaze ibibazo bifunguye nka \"koko se umeze ute\", kandi ufate uko bikwiye ijambo ryose bavuze ku kwiheba cyangwa kwiyahura aho kuryirengagiza. Bashishikarize kuvugana n'umukuru wizewe cyangwa umukozi w'ubuzima, kandi niba witaye ku mutekano wabo uwo munsi, ntubareke wenyine — hamagara ako kanya undi mukuru wizewe.",
        tags: ["mental health", "supporting friends", "crisis"],
      },
    ],
  },
];

const CRISIS_RESOURCES = [
  {
    name: "PLACEHOLDER — National mental health / suicide helpline (verify before launch)",
    contact: "PLACEHOLDER — replace with the real 24/7 helpline number",
    region: "National",
    order: 1,
  },
  {
    name: "PLACEHOLDER — Gender-based violence / abuse support line (verify before launch)",
    contact: "PLACEHOLDER — replace with the real hotline number",
    region: "National",
    order: 2,
  },
];

async function upsertTopicsAndArticles() {
  for (const topic of TOPICS) {
    const { articles, ...topicData } = topic;
    const savedTopic = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: topicData,
      create: topicData,
    });

    for (const article of articles) {
      const data = {
        topicId: savedTopic.id,
        titleEn: article.titleEn,
        titleRw: article.titleRw,
        bodyEn: article.bodyEn,
        bodyRw: article.bodyRw,
        tags: encodeJsonColumn(article.tags),
        // Marked REVIEWED (not NEEDS_REVIEW) so retrieval has real content to
        // ground chat answers in from day one, per the seed requirements —
        // but reviewedBy is honestly flagged, not a real clinician's name.
        // Re-review and re-approve every article here before production.
        status: REVIEWED,
        reviewedBy: "seed-script (AI-drafted placeholder — NOT reviewed by a licensed professional)",
        reviewedAt: new Date(),
      };
      await prisma.article.upsert({
        where: { topicId_titleEn: { topicId: savedTopic.id, titleEn: article.titleEn } },
        update: data,
        create: data,
      });
    }
  }
  console.log(`Seeded ${TOPICS.length} topics with their articles.`);
}

async function upsertCrisisResources() {
  const existingCount = await prisma.crisisResource.count();
  if (existingCount > 0) {
    console.log("Crisis resources already present, skipping.");
    return;
  }
  await prisma.crisisResource.createMany({ data: CRISIS_RESOURCES });
  console.log(`Seeded ${CRISIS_RESOURCES.length} placeholder crisis resources — REPLACE before launch.`);
}

async function upsertAppSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  if (existing) {
    // Deliberately not overwritten: AppSettings is admin-editable at runtime
    // (Phase 4 settings screen), so reseeding must never clobber a live
    // admin's configuration back to these defaults.
    console.log("AppSettings singleton already present, leaving admin-configured values as-is.");
    return;
  }
  await prisma.appSettings.create({
    data: {
      id: "singleton",
      aiProvider: "openai",
      aiModel: "gpt-4o-mini",
      responseStyleNote: "Warm, non-judgmental, 8th-grade reading level, 3-5 sentences.",
      restrictToKnowledgeBase: true,
      autoFlagCrisisLanguage: true,
      autoDetectLanguage: true,
    },
  });
  console.log("Seeded AppSettings singleton.");
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

// Masks keystrokes with `*` instead of echoing them, so the super-admin
// password doesn't land in terminal scrollback or a screen share. Falls
// back to the plain (visible) prompt when stdin isn't an interactive TTY
// (piped input, CI) since raw mode isn't available there.
function promptMasked(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    return prompt(question);
  }
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");

    let value = "";
    const onData = (char: string) => {
      switch (char) {
        case "\n":
        case "\r":
        case "": // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(value.trim());
          break;
        case "": // Ctrl-C
          process.stdout.write("\n");
          process.exit(130);
          break;
        case "": // backspace
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          value += char;
          process.stdout.write("*");
          break;
      }
    };
    stdin.on("data", onData);
  });
}

async function upsertSuperAdmin() {
  const existing = await prisma.adminUser.findFirst({ where: { role: SUPER_ADMIN } });
  if (existing) {
    console.log(`Super admin already exists (${existing.email}), skipping.`);
    return;
  }

  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? (await prompt("Super admin email: "));
  const password =
    process.env.SEED_SUPER_ADMIN_PASSWORD ?? (await promptMasked("Super admin password (min 12 chars): "));
  const name = process.env.SEED_SUPER_ADMIN_NAME ?? "Super Admin";

  if (!email || !email.includes("@")) {
    throw new Error("Super admin email is required and must look like an email address.");
  }
  if (!password || password.length < 12) {
    throw new Error("Super admin password is required and must be at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name, role: SUPER_ADMIN },
  });
  console.log(`Seeded super admin: ${email}`);
}

async function main() {
  await upsertTopicsAndArticles();
  await upsertCrisisResources();
  await upsertAppSettings();
  await upsertSuperAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

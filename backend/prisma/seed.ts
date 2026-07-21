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

// Default super admin account. Override via SEED_SUPER_ADMIN_EMAIL if needed;
// the password is never hardcoded — it must come from SEED_SUPER_ADMIN_PASSWORD
// (see .env.example) or, for local/interactive runs, a masked prompt.
const DEFAULT_SUPER_ADMIN_EMAIL = "sibomanadamascene1999@gmail.com";

// icon/colorToken match the SVG symbol ids and CSS color tokens already used
// in the design prototype ( test-g/index.html topic cards), so Phase 3 can
// wire these up without renaming anything.
const TOPICS = [
  {
    slug: "menstrual-health",
    nameEn: "Menstrual Health",
    nameRw: "Ubuzima bw'Imihango",
    nameFr: "Santé Menstruelle",
    nameSw: "Afya ya Hedhi",
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
        titleFr: "Qu'est-ce qu'un cycle menstruel normal ?",
        titleSw: "Mzunguko wa kawaida wa hedhi ni upi?",
        bodyFr:
          "Un cycle menstruel dure généralement entre 21 et 35 jours, compté du premier jour des règles au premier jour des règles suivantes. Les saignements durent généralement de 2 à 7 jours. La durée du cycle peut varier d'un mois à l'autre, surtout dans les premières années après le début des règles, et c'est normal. Si vos règles sont très irrégulières, très douloureuses, ou s'arrêtent pendant plusieurs mois sans grossesse, il vaut la peine d'en parler à un agent de santé.",
        bodySw:
          "Mzunguko wa hedhi kwa kawaida huchukua kati ya siku 21 hadi 35, ukihesabiwa kuanzia siku ya kwanza ya hedhi hadi siku ya kwanza ya hedhi inayofuata. Kutoka damu yenyewe kwa kawaida huchukua siku 2 hadi 7. Urefu wa mzunguko unaweza kutofautiana mwezi hadi mwezi, haswa katika miaka ya kwanza baada ya hedhi kuanza, na hilo ni la kawaida. Ikiwa hedhi yako ni isiyo ya kawaida sana, inauma sana, au inasimama kwa miezi kadhaa bila ujauzito, inafaa kuongea na mfanyakazi wa afya.",
        tags: ["period", "cycle", "menstruation", "menstrual health"],
        externalUrl: "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
      },
      {
        titleEn: "Managing period pain",
        titleRw: "Gucunga ububabare bw'imihango",
        bodyEn:
          "Mild cramping in the lower belly or back during your period is common and caused by the uterus contracting. A warm compress, gentle movement, staying hydrated, and rest can all help. Over-the-counter pain relief can also ease cramps when used as directed. If pain is severe enough to stop your daily activities, or gets worse over time, that's a good reason to see a health worker rather than just manage it alone.",
        bodyRw:
          "Kubabara gato mu nda yo hasi cyangwa mu mugongo mu gihe cy'imihango ni ibisanzwe kandi biterwa n'infuka y'inda yifunga. Gushyira igicucu gishyushye, kunyeganyega buhoro, kunywa amazi ahagije, no kuruhuka bifasha. Imiti ifasha kubabara igurwa idasabwa na muganga irashobora no gufasha, iyo ikoreshejwe uko byagenwe. Niba ububabare bukomeye ku buryo bukubuza gukora ibikorwa byawe bya buri munsi, cyangwa bugenda burushaho kwiyongera, ni impamvu yo kubona umukozi w'ubuzima aho kubyihanganira wenyine.",
        titleFr: "Gérer les douleurs menstruelles",
        titleSw: "Kudhibiti maumivu ya hedhi",
        bodyFr:
          "Des crampes légères dans le bas-ventre ou le dos pendant les règles sont courantes et causées par les contractions de l'utérus. Une compresse chaude, des mouvements doux, une bonne hydratation et du repos peuvent aider. Les antidouleurs en vente libre peuvent aussi soulager les crampes lorsqu'ils sont utilisés correctement. Si la douleur est assez forte pour vous empêcher de faire vos activités quotidiennes, ou s'aggrave avec le temps, c'est une bonne raison de consulter un agent de santé plutôt que de la gérer seul.",
        bodySw:
          "Kupata maumivu madogo sehemu ya chini ya tumbo au mgongo wakati wa hedhi ni kawaida na husababishwa na kusinyaa kwa uterasi. Kuweka kitambaa cha joto, kutembea taratibu, kunywa maji ya kutosha, na kupumzika kunaweza kusaidia. Dawa za kupunguza maumivu zinazouzwa bila dawa pia zinaweza kusaidia zikitumiwa kwa njia sahihi. Ikiwa maumivu ni makali kiasi cha kukuzuia kufanya shughuli zako za kila siku, au yanazidi kuwa mabaya kwa muda, hiyo ni sababu nzuri ya kuona mfanyakazi wa afya badala ya kujisumbua peke yako.",
        tags: ["period pain", "cramps", "menstruation"],
      },
      {
        titleEn: "Period hygiene basics",
        titleRw: "Isuku mu gihe cy'imihango",
        bodyEn:
          "Change your pad, tampon, or menstrual cup regularly — roughly every 4 to 8 hours depending on the product and your flow — to stay comfortable and reduce infection risk. Washing your hands before and after changing products, and washing the genital area with water (soap is optional and mild if used), is enough; you don't need special products to feel clean. Any clean cloth, pad, or product you have access to is okay to use.",
        bodyRw:
          "Hindura agakoti, tampon, cyangwa igikombe cy'imihango buri masaha 4 kugeza kuri 8 bitewe n'ikoresho ukoresha n'uko amaraso agenda, kugira ngo wumve umeze neza kandi ugabanye ibyago by'indwara. Gukaraba intoki mbere no nyuma yo guhindura ibikoresho, no gukaraba mu gice cy'imyanya ndangagitsina ukoresheje amazi (isabune ni ukubishaka, ukoresha imwe yoroheje) birahagije; nta bikoresho bidasanzwe ukeneye kugira ngo wiyumve uri musukuye. Icyapa cyose gisukuye ufite wagikoresha.",
        titleFr: "Les bases de l'hygiène menstruelle",
        titleSw: "Misingi ya usafi wa hedhi",
        bodyFr:
          "Changez votre serviette hygiénique, tampon ou coupe menstruelle régulièrement — environ toutes les 4 à 8 heures selon le produit et votre flux — pour rester à l'aise et réduire le risque d'infection. Se laver les mains avant et après avoir changé de produit, et laver la zone génitale avec de l'eau (le savon est facultatif et doux si utilisé), suffit ; vous n'avez pas besoin de produits spéciaux pour vous sentir propre. Tout tissu, serviette ou produit propre auquel vous avez accès peut être utilisé.",
        bodySw:
          "Badilisha pedi yako, tampoi, au kikombe cha hedhi mara kwa mara — takriban kila masaa 4 hadi 8 kulingana na bidhaa na mtiririko wako — ili ujisikie vizuri na kupunguza hatari ya maambukizi. Kunawa mikono kabla na baada ya kubadilisha bidhaa, na kuosha eneo la sehemu za siri kwa maji (sabuni ni ya hiari na nyepesi ikitumika) inatosha; huhitaji bidhaa maalum kujisikia safi. Kitambaa chochote safi, pedi, au bidhaa unayoweza kupata ni sawa kutumia.",
        tags: ["hygiene", "menstruation", "self care"],
      },
    ],
  },
  {
    slug: "pregnancy",
    nameEn: "Pregnancy",
    nameRw: "Gutwita",
    nameFr: "Grossesse",
    nameSw: "Ujauzito",
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
        titleFr: "Les premiers signes de grossesse",
        titleSw: "Dalili za mwanzo za ujauzito",
        bodyFr:
          "L'absence de règles est souvent le premier signe que quelqu'un remarque, accompagnée de nausées, de sensibilité des seins, de fatigue ou d'un besoin d'uriner plus souvent. Aucun de ces signes à lui seul ne confirme une grossesse — la seule façon fiable de le savoir est un test de grossesse, qui fonctionne le mieux quelques jours après l'absence de règles. Si un test est positif, consulter un agent de santé tôt vous aide à comprendre vos options et à commencer les soins dont vous avez besoin.",
        bodySw:
          "Kukosa hedhi mara nyingi ni dalili ya kwanza ambayo mtu anaona, pamoja na kichefuchefu, maumivu ya matiti, uchovu, au kuhitaji kukojoa mara nyingi zaidi. Hakuna hata moja kati ya hizi peke yake inayothibitisha ujauzito — njia pekee ya kuaminika ya kujua ni kipimo cha ujauzito, ambacho hufanya kazi vizuri siku chache baada ya kukosa hedhi. Ikiwa kipimo ni chanya, kuona mfanyakazi wa afya mapema kunakusaidia kuelewa chaguzi zako na kuanza huduma yoyote unayohitaji.",
        tags: ["pregnancy signs", "pregnancy test"],
        externalUrl: "https://www.who.int/news-room/fact-sheets/detail/sexual-health",
      },
      {
        titleEn: "Can I get pregnant during my period?",
        titleRw: "Nshobora gutwita ngiri mu mihango?",
        bodyEn:
          "Pregnancy during your period itself is less likely but not impossible, especially if your cycle is short or irregular, because sperm can survive in the body for several days and ovulation timing varies. If you are sexually active and not trying to become pregnant, using contraception consistently — not just avoiding sex during your period — is the reliable way to prevent pregnancy. A health worker can help you find a method that fits your life.",
        bodyRw:
          "Gutwita ngiri mu mihango ntibisanzwe ariko ntibishoboka rwose kutabaho, cyane cyane niba umuzunguruko wawe muto cyangwa udahoraho, kubera ko intanga z'umugabo zishobora kubaho mu mubiri iminsi myinshi kandi igihe cyo gutera amagi kigenda gihinduka. Niba ukorana imibonano mpuzabitsina kandi utifuza gutwita, gukoresha uburyo bwo kwirinda inda mu buryo buhoraho — atari ukwirinda imibonano mu gihe cy'imihango gusa — ni bwo buryo bwizewe bwo kwirinda inda. Umukozi w'ubuzima arashobora kugufasha kubona uburyo buhuye n'ubuzima bwawe.",
        titleFr: "Est-ce que je peux tomber enceinte pendant mes règles ?",
        titleSw: "Naweza kupata mimba wakati wa hedhi yangu?",
        bodyFr:
          "Tomber enceinte pendant vos règles est moins probable mais pas impossible, surtout si votre cycle est court ou irrégulier, car les spermatozoïdes peuvent survivre dans le corps plusieurs jours et le moment de l'ovulation varie. Si vous êtes sexuellement active et n'essayez pas de tomber enceinte, utiliser une contraception de façon constante — pas seulement éviter les rapports sexuels pendant vos règles — est le moyen fiable d'éviter une grossesse. Un agent de santé peut vous aider à trouver une méthode qui correspond à votre vie.",
        bodySw:
          "Kupata mimba wakati wa hedhi yenyewe kuna uwezekano mdogo lakini si jambo lisilowezekana, hasa ikiwa mzunguko wako ni mfupi au si wa kawaida, kwa sababu mbegu za kiume zinaweza kuishi katika mwili kwa siku kadhaa na wakati wa kutoa mayai hutofautiana. Ikiwa unafanya ngono na hujaribu kupata mimba, kutumia uzazi wa mpango mara kwa mara — si tu kuepuka ngono wakati wa hedhi yako — ndiyo njia ya kuaminika ya kuzuia ujauzito. Mfanyakazi wa afya anaweza kukusaidia kupata njia inayofaa maisha yako.",
        tags: ["pregnancy", "period", "ovulation"],
      },
      {
        titleEn: "When to see a health worker about pregnancy",
        titleRw: "Ni ryari ugomba kubona umukozi w'ubuzima ku byerekeye inda",
        bodyEn:
          "Whether you think you might be pregnant, want to plan for pregnancy, or are trying to avoid it, a health worker can support you without judgment. Early prenatal care — ideally starting in the first trimester — helps catch and manage issues early for a healthier pregnancy. You have the right to ask questions and get clear answers about your body and your options at any stage.",
        bodyRw:
          "Waba utekereza ko utwite, ushaka gutegura gutwita, cyangwa ushaka kwirinda gutwita, umukozi w'ubuzima arashobora kugufasha nta kugucira urubanza. Kwitabwaho hakiri kare mu gihe cy'inda — byaba byiza bitangiye mu mezi atatu ya mbere — bifasha kumenya no gucunga ibibazo hakiri kare kugira ngo inda igende neza. Ufite uburenganzira bwo kubaza ibibazo no kubona ibisubizo bisobanutse ku byerekeye umubiri wawe n'amahitamo yawe mu gihe cyose.",
        titleFr: "Quand consulter un agent de santé pour une grossesse",
        titleSw: "Wakati wa kuona mfanyakazi wa afya kuhusu ujauzito",
        bodyFr:
          "Que vous pensiez être enceinte, que vous souhaitiez planifier une grossesse ou que vous essayiez de l'éviter, un agent de santé peut vous soutenir sans jugement. Des soins prénatals précoces — idéalement commençant au premier trimestre — aident à détecter et gérer les problèmes tôt pour une grossesse plus saine. Vous avez le droit de poser des questions et d'obtenir des réponses claires sur votre corps et vos options à tout moment.",
        bodySw:
          "Iwe unafikiri unaweza kuwa na mimba, unataka kupanga ujauzito, au unajaribu kuuzuia, mfanyakazi wa afya anaweza kukusaidia bila kukuhukumu. Huduma za mapema za ujauzito — zinazofaa kuanza katika trimester ya kwanza — husaidia kugundua na kudhibiti matatizo mapema kwa ujauzito wenye afya bora. Una haki ya kuuliza maswali na kupata majibu wazi kuhusu mwili wako na chaguzi zako wakati wowote.",
        tags: ["prenatal care", "pregnancy", "health worker"],
      },
    ],
  },
  {
    slug: "relationships",
    nameEn: "Relationships",
    nameRw: "Imibanire",
    nameFr: "Relations",
    nameSw: "Mahusiano",
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
        titleFr: "Qu'est-ce qui rend une relation saine ?",
        titleSw: "Ni nini hufanya uhusiano kuwa mzuri?",
        bodyFr:
          "Des relations saines sont construites sur le respect, l'honnêteté, la confiance et les deux personnes se sentant libres de dire non. Vous devriez vous sentir capable de partager vos opinions, de passer du temps avec vos amis et votre famille, et de prendre vos propres décisions sans crainte. Les désaccords sont normaux, mais ils doivent être gérés sans menaces, insultes ou contrôle. Si une relation vous fait vous sentir petit ou effrayé, cela vaut la peine d'en parler à quelqu'un en qui vous avez confiance.",
        bodySw:
          "Mahusiano mazuri yanajengwa juu ya heshima, uaminifu, kuaminiana, na watu wote wawili kujisikia huru kusema hapana. Unapaswa kujisikia uwezo wa kushiriki maoni yako, kutumia wakati na marafiki na familia, na kufanya maamuzi yako mwenyewe bila woga. Kutoelewana ni kawaida, lakini kunapaswa kushughulikiwa bila vitisho, matusi, au udhibiti. Ikiwa uhusiano unakufanya ujisikie mdogo au mwenye hofu, hiyo inafaa kuzungumziwa na mtu unayemwamini.",
        tags: ["relationships", "healthy relationship", "respect"],
        externalUrl: "https://www.who.int/news-room/fact-sheets/detail/adolescent-health",
      },
      {
        titleEn: "Recognizing pressure or coercion",
        titleRw: "Kumenya igihe bakubangamiye cyangwa bakwongorera",
        bodyEn:
          "Pressure to do something sexual — through guilt, repeated asking, threats, or making you feel you owe someone — is not consent, even in a relationship. Real consent is freely given, can be withdrawn at any time, and isn't the result of fear or manipulation. If someone pressures you, it is not your fault, and you deserve support. Talking to a trusted adult, counselor, or health worker is a safe next step.",
        bodyRw:
          "Kubangamira umuntu ngo akore ikintu cy'imibonano mpuzabitsina — binyuze mu kumushinja icyaha, kubaza kenshi, guhahamura, cyangwa kumutera kwiyumva ko afitiye undi umwenda — ntibisobanura ko yemeye. Kwemera nyakuri ni ukwitanga ku bushake, gushobora gukurwaho igihe icyo ari cyo cyose, kandi ntibiterwa n'ubwoba cyangwa uburiganya. Niba hari ubangamiye, si icyaha cyawe, kandi ukwiye gufashwa. Kuvugana n'umuntu mukuru wizeye, umujyanama, cyangwa umukozi w'ubuzima ni intambwe yizewe ikurikiraho.",
        titleFr: "Reconnaître la pression ou la coercition",
        titleSw: "Kutambua shinikizo au kulazimishwa",
        bodyFr:
          "La pression pour faire quelque chose de sexuel — par la culpabilité, des demandes répétées, des menaces ou en vous faisant sentir que vous devez quelque chose à quelqu'un — n'est pas un consentement, même dans une relation. Le vrai consentement est donné librement, peut être retiré à tout moment et n'est pas le résultat de la peur ou de la manipulation. Si quelqu'un vous fait pression, ce n'est pas de votre faute et vous méritez du soutien. Parler à un adulte de confiance, un conseiller ou un agent de santé est une prochaine étape sûre.",
        bodySw:
          "Shinikizo la kufanya jambo la kingono — kwa hatia, kuuliza mara kwa mara, vitisho, au kukufanya uhisi kuwa una deni kwa mtu — si ridhaa, hata katika uhusiano. Ridhaa halisi hutolewa kwa hiari, inaweza kuondolewa wakati wowote, na si matokeo ya woga au ghiliba. Ikiwa mtu anakushinikiza, si kosa lako, na unastahili msaada. Kuzungumza na mtu mzima unayemwamini, mshauri, au mfanyakazi wa afya ni hatua inayofuata salama.",
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
    nameFr: "Planning Familial",
    nameSw: "Uzazi wa Mpango",
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
        titleFr: "Aperçu des méthodes de contraception",
        titleSw: "Muhtasari wa njia za uzazi wa mpango",
        bodyFr:
          "Il existe plusieurs types de contraception : les méthodes barrières comme les préservatifs, les méthodes hormonales comme les pilules, les injections ou les implants, les méthodes de longue durée comme les DIU, et les méthodes permanentes. Chacune a une efficacité, des effets secondaires et une fréquence d'utilisation différents. Les préservatifs sont la seule méthode qui protège également contre le VIH et les autres IST. Un agent de santé peut vous guider vers ce qui correspond à votre santé, vos projets et votre mode de vie.",
        bodySw:
          "Kuna aina kadhaa za uzazi wa mpango: njia za kuzuia kama kondomu, njia za homoni kama vidonge, sindano, au vipandikizi, njia za muda mrefu kama IUD, na njia za kudumu. Kila moja ina ufanisi tofauti, madhara tofauti, na mara ngapi unahitaji kuikumbuka. Kondomu ndiyo njia pekee ambayo pia husaidia kulinda dhidi ya VVU na magonjwa mengine ya zinaa. Mfanyakazi wa afya anaweza kukusaidia kuchagua kinachofaa afya yako, mipango yako, na mtindo wako wa maisha.",
        tags: ["contraception", "family planning", "birth control"],
        externalUrl: "https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception",
      },
      {
        titleEn: "Where to get family planning services",
        titleRw: "Aho ubona serivisi zo kuboneza urubyaro",
        bodyEn:
          "Public health centers and hospitals across Rwanda offer family planning counseling and methods, often at low or no cost. Community health workers can also connect you to services closer to home. You don't need permission from a partner or parent to ask questions or seek information about your options, though a health worker can talk through what's involved for the method you choose.",
        bodyRw:
          "Ibigo nderabuzima n'amavuriro ya Leta hirya no hino mu Rwanda batanga inama n'uburyo bwo kuboneza urubyaro, akenshi ku giciro gito cyangwa nta kiguzi. Abajyanama b'ubuzima bo mu baturage barashobora nabo kukwerekeza aho serivisi ziri hafi yawe. Nta ruhusa ukeneye kubwa mugenzi wawe cyangwa umubyeyi kugira ngo ubaze ibibazo cyangwa ushake amakuru ku mahitamo yawe, nubwo umukozi w'ubuzima yagusobanurira icyo uburyo wahisemo busaba.",
        titleFr: "Où trouver des services de planning familial",
        titleSw: "Wapi kupata huduma za uzazi wa mpango",
        bodyFr:
          "Les centres de santé publics et les hôpitaux à travers le Rwanda offrent des conseils et des méthodes de planning familial, souvent à faible coût ou gratuitement. Les agents de santé communautaires peuvent également vous orienter vers des services plus proches de chez vous. Vous n'avez pas besoin de la permission d'un partenaire ou d'un parent pour poser des questions ou chercher des informations sur vos options, bien qu'un agent de santé puisse vous expliquer ce qu'implique la méthode que vous choisissez.",
        bodySw:
          "Vituo vya afya vya umma na hospitali kote nchini Rwanda vinatoa ushauri na njia za uzazi wa mpango, mara nyingi kwa gharama ndogo au bure. Wafanyakazi wa afya wa jamii wanaweza pia kukuunganisha na huduma zilizo karibu na nyumbani kwako. Huhitaji ruhusa kutoka kwa mwenza au mzazi kuuliza maswali au kutafuta habari kuhusu chaguzi zako, ingawa mfanyakazi wa afya anaweza kuelezea kile kinachohusika kwa njia unayochagua.",
        tags: ["family planning", "health services", "access"],
      },
      {
        titleEn: "Common myths about contraception",
        titleRw: "Ibitekerezo bitari byo ku kuboneza urubyaro",
        bodyEn:
          "Contraception does not cause infertility — most methods stop working as soon as you stop using them, and fertility returns close to normal timelines afterward. It's also a myth that you must have already had a child to use contraception safely. Different methods suit different people, so if one causes side effects that bother you, that doesn't mean all methods will — a health worker can help you try another option.",
        bodyRw:
          "Kuboneza urubyaro ntibitera ubugumba — uburyo bwinshi buhita buta agaciro igihe uretse kubukoresha, kandi ubushobozi bwo kubyara bugaruka mu gihe gisanzwe nyuma. Ni na ikinyoma ko ugomba kuba warabyaye kugira ngo ukoreshe uburyo bwo kuboneza urubyaro mu mutekano. Uburyo butandukanye buhuye n'abantu batandukanye, bityo niba bumwe butera ingaruka zikubabaza, ntibisobanura ko ubundi bwose buzagira ingaruka zimwe — umukozi w'ubuzima arashobora kugufasha kugerageza ubundi buryo.",
        titleFr: "Idées reçues sur la contraception",
        titleSw: "Hadithi za kawaida kuhusu uzazi wa mpango",
        bodyFr:
          "La contraception ne rend pas stérile — la plupart des méthodes cessent d'agir dès que vous arrêtez de les utiliser, et la fertilité revient à des délais normaux par la suite. C'est aussi un mythe qu'il faut avoir déjà eu un enfant pour utiliser la contraception en toute sécurité. Différentes méthodes conviennent à différentes personnes, donc si l'une provoque des effets secondaires qui vous dérangent, cela ne signifie pas que toutes les méthodes le feront — un agent de santé peut vous aider à essayer une autre option.",
        bodySw:
          "Uzazi wa mpango hausababishi utasa — njia nyingi huacha kufanya kazi mara tu unapoacha kuzitumia, na uwezo wa kupata mimba hurudi kwa wakati wa kawaida baadaye. Ni hadithi pia kwamba lazima uwe umewahi kupata mtoto ili kutumia uzazi wa mpango kwa usalama. Njia tofauti zinafaa watu tofauti, kwa hivyo ikiwa moja inaleta madhara yanayokusumbua, hiyo haimaanishi kwamba njia zote zitafanya hivyo — mfanyakazi wa afya anaweza kukusaidia kujaribu njia nyingine.",
        tags: ["contraception", "myths", "family planning"],
      },
    ],
  },
  {
    slug: "hiv-stis",
    nameEn: "HIV & STIs",
    nameRw: "Virusi itera SIDA n'izindi Ndwara Zandurira mu Mibonano",
    nameFr: "VIH et IST",
    nameSw: "VVU na Magonjwa ya Zina",
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
        titleFr: "Comment le VIH se transmet et ne se transmet pas",
        titleSw: "Jinsi VVU inavyoambukizwa na isivyoambukizwa",
        bodyFr:
          "Le VIH se transmet par des liquides corporels spécifiques — le sang, le sperme, les liquides vaginaux et le lait maternel — principalement par des rapports sexuels non protégés, le partage d'aiguilles, ou de la mère à l'enfant pendant la grossesse ou l'accouchement. Il ne se transmet pas par un contact occasionnel comme les câlins, le partage de nourriture ou l'utilisation des mêmes toilettes. Utiliser correctement les préservatifs et se faire dépister régulièrement sont les moyens les plus fiables de vous protéger et de connaître votre statut.",
        bodySw:
          "VVU huambukizwa kupitia viowevu maalum vya mwili — damu, shahawa, viowevu vya uke, na maziwa ya mama — hasa kupitia ngono isiyolindwa, kushirikiana sindano, au kutoka kwa mzazi hadi kwa mtoto wakati wa ujauzito au kuzaliwa. Haiambukizwi kupitia mawasiliano ya kawaida kama kukumbatiana, kushiriki chakula, au kutumia choo kimoja. Kutumia kondomu kwa usahihi na kupimwa mara kwa mara ndiyo njia za kuaminika zaidi za kujilinda na kujua hali yako.",
        tags: ["hiv", "transmission", "sti"],
        externalUrl: "https://www.who.int/news-room/fact-sheets/detail/hiv-aids",
      },
      {
        titleEn: "Getting tested for HIV and STIs",
        titleRw: "Gupimwa virusi itera SIDA n'izindi ndwara zandurira mu mibonano",
        bodyEn:
          "Testing is quick, often free at public health centers, and results are kept confidential. Many STIs, including HIV, don't cause obvious symptoms at first, so testing is the only way to know for sure. If you're sexually active, regular testing — even without symptoms — is a normal part of taking care of your health, not a sign that something is wrong.",
        bodyRw:
          "Gupimwa birihuse, akenshi ni ubuntu mu bigo nderabuzima bya Leta, kandi ibisubizo bibikwa mu ibanga. Indwara nyinshi zandurira mu mibonano, harimo na virusi itera SIDA, ntizigaragaza ibimenyetso bigaragara mu ntangiriro, bityo gupimwa ni bwo buryo bwonyine bwo kumenya neza. Niba ukorana imibonano mpuzabitsina, gupimwa kenshi — n'igihe utagira ibimenyetso — ni igice gisanzwe cyo kwita ku buzima bwawe, ntabwo ari ikimenyetso cy'uko hari ikibazo.",
        titleFr: "Se faire dépister pour le VIH et les IST",
        titleSw: "Kupimwa VVU na magonjwa ya zinaa",
        bodyFr:
          "Le dépistage est rapide, souvent gratuit dans les centres de santé publics, et les résultats restent confidentiels. De nombreuses IST, y compris le VIH, ne provoquent pas de symptômes évidents au début, donc le dépistage est le seul moyen d'en être sûr. Si vous êtes sexuellement actif, un dépistage régulier — même sans symptômes — est une partie normale des soins de votre santé, pas un signe que quelque chose ne va pas.",
        bodySw:
          "Upimaji ni wa haraka, mara nyingi ni bure katika vituo vya afya vya umma, na matokeo yanawekwa kwa siri. Magonjwa mengi ya zinaa, ikiwemo VVU, hayaoni dalili za wazi mwanzoni, kwa hivyo upimaji ndiyo njia pekee ya kujua kwa uhakika. Ikiwa unafanya ngono, kupimwa mara kwa mara — hata bila dalili — ni sehemu ya kawaida ya kutunza afya yako, si ishara kwamba kuna kitu kibaya.",
        tags: ["testing", "hiv", "sti"],
      },
      {
        titleEn: "Using condoms correctly",
        titleRw: "Gukoresha udukingirizo neza",
        bodyEn:
          "Check the expiry date and package for damage before use, and open the wrapper carefully to avoid tearing the condom. Pinch the tip to leave space for semen, roll it on fully before any genital contact, and use a new condom every time and for every act. After use, hold the base while withdrawing and dispose of it — never reuse a condom. Water- or silicone-based lubricant can help prevent breakage; avoid oil-based products with latex condoms.",
        bodyRw:
          "Reba itariki y'irangira n'uko agakoni katameze nabi mbere yo gukoresha, hanyuma ufungure agakoni witonze kugira ngo utamena agakingirizo. Fata umutwe wako ukarekera umwanya w'intanga, ukanambara neza mbere y'uko hagira ikigira uruhande rw'imyanya ndangagitsina rukorana, kandi ukoreshe agakingirizo gashya buri gihe kandi kuri buri mibonano. Nyuma yo gukoresha, fata ikibindi mu gihe ukuramo, hanyuma ukajugunye — ntukigere wongera gukoresha agakingirizo. Amavuta yifashisha amazi cyangwa silicone yafasha kwirinda gucika; wirinde amavuta y'amavuta n'agakingirizo ka latex.",
        titleFr: "Utiliser correctement les préservatifs",
        titleSw: "Kutumia kondomu kwa usahihi",
        bodyFr:
          "Vérifiez la date d'expiration et l'emballage pour tout dommage avant utilisation, et ouvrez l'emballage avec précaution pour éviter de déchirer le préservatif. Pincez le bout pour laisser de l'espace pour le sperme, déroulez-le complètement avant tout contact génital, et utilisez un nouveau préservatif à chaque fois et pour chaque acte. Après utilisation, tenez la base en vous retirant et jetez-le — ne réutilisez jamais un préservatif. Un lubrifiant à base d'eau ou de silicone peut aider à éviter les déchirures ; évitez les produits à base d'huile avec les préservatifs en latex.",
        bodySw:
          "Angalia tarehe ya kuisha na kifurushi kwa uharibifu wowote kabla ya kutumia, na ufungue kifurushi kwa uangalifu ili kuepuka kurarua kondomu. Bana ncha ili kuacha nafasi ya shahawa, viringisha kabisa kabla ya mgusano wowote wa sehemu za siri, na tumia kondomu mpya kila wakati na kwa kila tendo. Baada ya matumizi, shika msingi wakati unajiondoa na utupe — usitumie tena kondomu. Vilainishi vyenye maji au silikoni vinaweza kusaidia kuzuia kupasuka ; epuka bidhaa zenye mafuta na kondomu za mpira.",
        tags: ["condoms", "protection", "sti"],
      },
    ],
  },
  {
    slug: "mental-health",
    nameEn: "Mental Health",
    nameRw: "Ubuzima bwo mu Mutwe",
    nameFr: "Santé Mentale",
    nameSw: "Afya ya Akili",
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
        titleFr: "Gérer le stress et l'anxiété",
        titleSw: "Kukabiliana na msongo wa mawazo na wasiwasi",
        bodyFr:
          "Tout le monde se sent stressé ou anxieux parfois — c'est une réaction normale, pas une faiblesse. Des choses simples peuvent aider sur le moment : respirer lentement, nommer ce que vous ressentez, bouger votre corps, ou parler à quelqu'un en qui vous avez confiance. Dormir régulièrement, bien manger et limiter la caféine peuvent aussi faire une réelle différence avec le temps. Si le stress ou l'inquiétude commence à interférer avec l'école, le sommeil ou les relations la plupart des jours, il vaut la peine de parler à un conseiller ou un agent de santé.",
        bodySw:
          "Kila mtu huhisi msongo wa mawazo au wasiwasi wakati mwingine — ni mwitikio wa kawaida, si udhaifu. Mambo rahisi yanaweza kusaidia kwa wakati huo: kupumua polepole, kutaja unachohisi, kusogeza mwili wako, au kuzungumza na mtu unayemwamini. Kulala vizuri, kula vizuri, na kupunguza kafeini kunaweza pia kuleta tofauti kubwa kwa muda. Ikiwa msongo wa mawazo au wasiwasi huanza kuingilia shule, usingizi, au mahusiano siku nyingi, inafaa kuzungumza na mshauri au mfanyakazi wa afya.",
        tags: ["stress", "anxiety", "coping"],
      },
      {
        titleEn: "When sadness might be depression",
        titleRw: "Igihe agahinda gashobora kuba ari indwara y'agahinda",
        bodyEn:
          "Feeling sad after a hard day is normal, but depression is different: it's a low mood, loss of interest in things you used to enjoy, changes in sleep or appetite, or low energy that lasts most of the day, nearly every day, for two weeks or more. Depression is a real health condition, not a personal failure, and it's treatable. If this sounds like you, reaching out to a counselor or health worker is a strong, not weak, thing to do.",
        bodyRw:
          "Kwiyumva ubabaye nyuma y'umunsi ugoye ni ibisanzwe, ariko indwara y'agahinda itandukanye: ni uguhora umutima muremure, guta amatsiko mu bintu wahoze ukunda, guhinduka kw'ibitotsi cyangwa uburyo bwo kurya, cyangwa kubura imbaraga bimara igice kinini cy'umunsi, hafi buri munsi, mu byumweru bibiri cyangwa birenga. Indwara y'agahinda ni indwara nyayo, ntabwo ari ikinyoma cyangwa intege nke, kandi irakizwa. Niba ibi bikwerekeranye, kuvugana n'umujyanama cyangwa umukozi w'ubuzima ni igikorwa cy'imbaraga, ntabwo ari intege nke.",
        titleFr: "Quand la tristesse pourrait être une dépression",
        titleSw: "Wakati huzuni inaweza kuwa unyogovu",
        bodyFr:
          "Se sentir triste après une journée difficile est normal, mais la dépression est différente : c'est une humeur basse, une perte d'intérêt pour les choses que vous aimiez, des changements dans le sommeil ou l'appétit, ou un manque d'énergie qui dure la plupart de la journée, presque tous les jours, pendant deux semaines ou plus. La dépression est un véritable problème de santé, pas un échec personnel, et elle est traitable. Si cela vous ressemble, tendre la main à un conseiller ou un agent de santé est une chose forte, pas faible, à faire.",
        bodySw:
          "Kuhuzunika baada ya siku ngumu ni kawaida, lakini unyogovu ni tofauti: ni hali ya chini ya hisia, kupoteza hamu ya vitu ulivyokuwa ukipenda, mabadiliko ya usingizi au hamu ya kula, au ukosefu wa nishati unaodumu kwa sehemu kubwa ya siku, karibu kila siku, kwa wiki mbili au zaidi. Unyogovu ni hali halisi ya kiafya, si kushindwa kibinafsi, na inatibika. Ikiwa hii inakusoundia, kumfikia mshauri au mfanyakazi wa afya ni jambo la nguvu, si la udhaifu.",
        tags: ["depression", "mental health", "mood"],
      },
      {
        titleEn: "How to support a friend who is struggling",
        titleRw: "Uko wafasha inshuti igoswe n'ibibazo",
        bodyEn:
          "You don't need to have the answers — often, listening without judging or trying to immediately fix things is the most helpful thing you can do. Let them know you're there, ask open questions like \"how are you really doing?\", and take mentions of hopelessness or self-harm seriously rather than dismissing them. Encourage them to talk to a trusted adult or health worker, and if you're worried about their immediate safety, don't leave them alone — get another trusted adult involved right away.",
        bodyRw:
          "Ntugomba kuba ufite ibisubizo — akenshi, kumva nta gucira urubanza cyangwa kugerageza gukemura ibintu ako kanya ni cyo gikorwa gifasha kurusha ibindi. Mumenyeshe ko uri hafi yabo, babaze ibibazo bifunguye nka \"koko se umeze ute\", kandi ufate uko bikwiye ijambo ryose bavuze ku kwiheba cyangwa kwiyahura aho kuryirengagiza. Bashishikarize kuvugana n'umukuru wizewe cyangwa umukozi w'ubuzima, kandi niba witaye ku mutekano wabo uwo munsi, ntubareke wenyine — hamagara ako kanya undi mukuru wizewe.",
        titleFr: "Comment soutenir un ami qui traverse une période difficile",
        titleSw: "Jinsi ya kumsaidia rafiki anayehangaika",
        bodyFr:
          "Vous n'avez pas besoin d'avoir les réponses — souvent, écouter sans juger ou sans essayer de régler les choses immédiatement est la chose la plus utile que vous puissiez faire. Faites-lui savoir que vous êtes là, posez des questions ouvertes comme « comment vas-tu vraiment ? », et prenez au sérieux les mentions de désespoir ou d'automutilation sans les rejeter. Encouragez-le à parler à un adulte de confiance ou à un agent de santé, et si vous êtes inquiet pour sa sécurité immédiate, ne le laissez pas seul — faites intervenir un autre adulte de confiance immédiatement.",
        bodySw:
          "Huhitaji kuwa na majibu — mara nyingi, kusikiliza bila kuhukumu au kujaribu kurekebisha mambo mara moja ndicho kitu cha msaada zaidi unachoweza kufanya. Mjulishe kuwa upo, uliza maswali wazi kama 'hali yako kweli ikoje?', na uchukue kwa uzito kutaja kukata tamaa au kujidhuru badala ya kupuuza. Mhimize kuzungumza na mtu mzima anayemwamini au mfanyakazi wa afya, na ikiwa una wasiwasi kuhusu usalama wake wa haraka, usimwache peke yake — mshirikishe mtu mwingine mzima anayemwamini mara moja.",
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
        titleFr: article.titleFr ?? "",
        titleSw: article.titleSw ?? "",
        bodyEn: article.bodyEn,
        bodyRw: article.bodyRw,
        bodyFr: article.bodyFr ?? "",
        bodySw: article.bodySw ?? "",
        externalUrl: article.externalUrl ?? null,
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

// Approximate public coordinates for well-known Kigali facilities — good
// enough to exercise the map/search UI in dev. Real deployments must verify
// every coordinate, service list, and contact number before going live.
const HEALTH_FACILITIES = [
  {
    name: "CHUK (Centre Hospitalier Universitaire de Kigali)",
    type: "HOSPITAL",
    latitude: -1.9548,
    longitude: 30.0606,
    district: "Nyarugenge",
    sector: "Nyarugenge",
    services: ["Maternal Health", "Mental Health", "Emergency Care"],
    contact: "+250 788 123 456",
  },
  {
    name: "King Faisal Hospital",
    type: "HOSPITAL",
    latitude: -1.9558,
    longitude: 30.0925,
    district: "Gasabo",
    sector: "Kacyiru",
    services: ["Specialist Care", "HIV Testing"],
    contact: "+250 788 234 567",
  },
  {
    name: "Kibagabaga Hospital",
    type: "HOSPITAL",
    latitude: -1.9276,
    longitude: 30.1074,
    district: "Gasabo",
    sector: "Kibagabaga",
    services: ["Maternal Health", "Family Planning"],
    contact: "+250 788 345 678",
  },
  {
    name: "Kicukiro Health Centre",
    type: "HEALTH_CENTRE",
    latitude: -1.9646,
    longitude: 30.1044,
    district: "Kicukiro",
    sector: "Kicukiro",
    services: ["Family Planning", "HIV Testing"],
    contact: "+250 788 456 789",
  },
  {
    name: "Remera Polyclinic",
    type: "CLINIC",
    latitude: -1.9536,
    longitude: 30.1044,
    district: "Gasabo",
    sector: "Remera",
    services: ["Mental Health", "General Consultation"],
    contact: "+250 788 567 890",
  },
  {
    name: "Gikondo Pharmacy",
    type: "PHARMACY",
    latitude: -1.9706,
    longitude: 30.0736,
    district: "Kicukiro",
    sector: "Gikondo",
    services: ["Pharmacy"],
    contact: "+250 788 678 901",
  },
];

async function upsertHealthFacilities() {
  const existingCount = await prisma.healthFacility.count();
  if (existingCount > 0) {
    console.log("Health facilities already present, skipping.");
    return;
  }
  await prisma.healthFacility.createMany({
    data: HEALTH_FACILITIES.map((f) => ({ ...f, services: encodeJsonColumn(f.services) })),
  });
  console.log(`Seeded ${HEALTH_FACILITIES.length} placeholder health facilities — VERIFY before launch.`);
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

  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? DEFAULT_SUPER_ADMIN_EMAIL;
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

async function seedUsers() {
  const pwHash = await bcrypt.hash("test1234", 12);

  const users = [
    {
      email: "teen@example.com",
      name: "Marie Uwimana",
      role: "TEENAGER" as const,
      preferredLanguage: "RW",
    },
    {
      email: "parent@example.com",
      name: "Jean Habimana",
      role: "PARENT_GUARDIAN" as const,
      preferredLanguage: "EN",
    },
    {
      email: "nurse@example.com",
      name: "Alice Mukamana",
      role: "HEALTHCARE_PROFESSIONAL" as const,
      preferredLanguage: "EN",
      professionalType: "CHW" as const,
      specialization: "Adolescent SRH",
    },
    {
      email: "gov@example.com",
      name: "Patrick Kagame",
      role: "GOVERNMENT_USER" as const,
      preferredLanguage: "FR",
      govLevel: "DISTRICT" as const,
      regionName: "Kicukiro",
    },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (exists) {
      console.log(`User "${u.email}" already exists, skipping.`);
      continue;
    }

    const data: any = {
      email: u.email,
      passwordHash: pwHash,
      name: u.name,
      role: u.role,
      preferredLanguage: u.preferredLanguage,
    };

    if (u.role === "HEALTHCARE_PROFESSIONAL") {
      data.healthcareProfessional = {
        create: {
          professionalType: u.professionalType,
          specialization: u.specialization ?? null,
          approvalStatus: "APPROVED",
          approvedBy: "seed-script",
          approvedAt: new Date(),
        },
      };
    }

    if (u.role === "GOVERNMENT_USER") {
      data.governmentUser = {
        create: {
          level: u.govLevel,
          regionName: u.regionName ?? "",
        },
      };
    }

    await prisma.user.create({ data });
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }
}

async function main() {
  await upsertTopicsAndArticles();
  await upsertCrisisResources();
  await upsertHealthFacilities();
  await upsertAppSettings();
  await upsertSuperAdmin();
  await seedUsers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

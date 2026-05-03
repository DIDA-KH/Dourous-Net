'use client'
import { createContext, useContext, useLayoutEffect, useEffect, useState, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const THEME_KEY  = 'dn_theme'
const LANG_KEY   = 'dn_lang'
const ACCENT_KEY = 'dn_accent'

/* ── Dynamic data translation maps ── */
const DATA_TRANSLATIONS: Record<string, string> = {
  // Specialties
  'Mathématiques':       'en:Mathematics|ar:رياضيات',
  'Physique-Chimie':     'en:Physics-Chemistry|ar:فيزياء-كيمياء',
  'Sciences Naturelles': 'en:Natural Sciences|ar:علوم طبيعية',
  'Français':            'en:French|ar:فرنسية',
  'Anglais':             'en:English|ar:إنجليزية',
  'Arabe':               'en:Arabic|ar:عربية',
  'Histoire-Géographie': 'en:History-Geography|ar:تاريخ-جغرافيا',
  'Philosophie':         'en:Philosophy|ar:فلسفة',
  'Informatique':        'en:Computer Science|ar:إعلام آلي',
  'Économie':            'en:Economics|ar:اقتصاد',
  'Sciences Islamiques': 'en:Islamic Sciences|ar:علوم إسلامية',
  'Sciences islamiques': 'en:Islamic Sciences|ar:علوم إسلامية',
  'Tamazight':           'en:Tamazight|ar:أمازيغية',
  // Levels
  'Primaire':            'en:Primary|ar:ابتدائي',
  'Moyen (CEM)':         'en:Middle School|ar:متوسط',
  'Lycée':               'en:High School|ar:ثانوي',
  '1ère AS':             'en:1st Year HS|ar:أولى ثانوي',
  '2ème AS':             'en:2nd Year HS|ar:ثانية ثانوي',
  '3ème AS (BAC)':       'en:3rd Year (BAC)|ar:ثالثة ثانوي (باك)',
  'Université':          'en:University|ar:جامعة',
  'Adulte':              'en:Adult|ar:بالغ',
}

function translateData(val: string, lang: string): string {
  if (lang === 'fr' || !val) return val
  const mapping = DATA_TRANSLATIONS[val]
  if (!mapping) return val
  const parts = mapping.split('|')
  for (const p of parts) {
    const [l, t] = p.split(':')
    if (l === lang) return t
  }
  return val
}

export const ACCENT_COLORS: Record<string, { name: string; hex: string; dark: string; shadow: string }> = {
  blue:   { name: 'Blue',   hex: '#2563eb', dark: '#3b82f6', shadow: 'rgba(37,99,235,.3)'   },
  teal:   { name: 'Teal',   hex: '#0d9488', dark: '#14b8a6', shadow: 'rgba(13,148,136,.3)'  },
  green:  { name: 'Green',  hex: '#16a34a', dark: '#22c55e', shadow: 'rgba(22,163,74,.3)'   },
  violet: { name: 'Violet', hex: '#7c3aed', dark: '#8b5cf6', shadow: 'rgba(124,58,237,.3)'  },
  indigo: { name: 'Indigo', hex: '#4f46e5', dark: '#6366f1', shadow: 'rgba(79,70,229,.3)'   },
  pink:   { name: 'Pink',   hex: '#db2777', dark: '#ec4899', shadow: 'rgba(219,39,119,.3)'  },
  orange: { name: 'Orange', hex: '#ea580c', dark: '#f97316', shadow: 'rgba(234,88,12,.3)'   },
  red:    { name: 'Red',    hex: '#dc2626', dark: '#ef4444', shadow: 'rgba(220,38,38,.3)'   },
  amber:  { name: 'Amber',  hex: '#d97706', dark: '#f59e0b', shadow: 'rgba(217,119,6,.3)'   },
  slate:  { name: 'Slate',  hex: '#475569', dark: '#64748b', shadow: 'rgba(71,85,105,.3)'   },
}

export type Theme = 'light' | 'dark'
export type Lang  = 'fr' | 'en' | 'ar'

const T: Record<Lang, Record<string, Record<string, string>>> = {
  fr: {
    common: { loading:'Chargement…', save:'Enregistrer', cancel:'Annuler', edit:'Modifier',
      delete:'Supprimer', confirm:'Confirmer', back:'Retour', or:'ou', search:'Rechercher',
      copyright:'© 2026 Dourous-Net — Algérie', yes:'Oui', no:'Non', close:'Fermer',
      perHour:'/heure', onRequest:'Sur demande', viewAll:'Voir tout', notFound:'Introuvable' },
    theme: { light:'Clair', dark:'Sombre', appearance:'Apparence', color:'Couleur', lang:'Langue' },
    nav: { dashboard:'Tableau de bord', teachers:'Professeurs', sessions:'Mes séances',
      profile:'Mon profil', about:'À propos', logout:'Déconnexion', menu:'Menu',
      mySessions:'Mes séances', myStudents:'Mes élèves', myProfile:'Mon profil', myCourses:'Mes cours' },
    auth: {
      loginTitle:'Se connecter', registerTitle:'Créer un compte',
      email:'Adresse email', password:'Mot de passe', fullName:'Nom complet',
      confirmPassword:'Confirmer le mot de passe',
      noAccount:'Pas encore inscrit ?', hasAccount:'Déjà inscrit ?',
      createAccount:'Créer un compte', loginLink:'Se connecter',
      minPw:'min. 8 caractères', submit:'Se connecter', submitReg:'Créer mon compte',
      successTitle:'Compte créé !',
      successDesc:'Vérifiez votre email pour confirmer, puis connectez-vous.',
      goLogin:'Aller à la connexion', wrongCreds:'Email ou mot de passe incorrect.',
      terms:'En vous inscrivant, vous acceptez nos conditions d\'utilisation.',
      configHint:'⚙️ Supabase → Auth → URL Config → Site URL = http://localhost:3000',
      chooseRole:'Je suis…', student:'Élève / Étudiant', teacher:'Professeur',
      studentDesc:'Je cherche des cours particuliers', teacherDesc:'Je donne des cours',
      wilaya:'Wilaya', level:'Niveau scolaire', specialty:'Matière enseignée',
      loginDesc:'Accédez à vos séances, vos professeurs et vos devoirs.',
      welcomeBack:'Bon retour',
      loginRoleWarning:'Connexion détectée en tant que :',
      confirmLoginRole:'Êtes-vous sûr de vouloir vous connecter en tant que',
    },
    landing: {
      badge:'Plateforme éducative — Algérie',
      title:'Le meilleur cours particulier, en ligne.',
      sub:'Connectez étudiants et professeurs en Algérie. Réservez, accédez aux meilleurs cours et apprenez à votre rythme.',
      start:'Commencer', login:'Connexion', signup:'S\'inscrire',
      activeProfessors:'Professeurs actifs', sessionsCompleted:'Séances réalisées', subjects:'Matières',
      howTitle:'Comment ça marche ?', whyTitle:'Pourquoi Dourous-Net ?',
      whySub:'Une plateforme conçue pour la réussite des élèves algériens.',
      ctaTitle:'Prêt à progresser ?', ctaBtn:'Créer mon compte gratuit',
      trust1:'Inscription gratuite', trust2:'Accès rapide', trust3:'Apprentissage asynchrone',
      feat1Title:'Professeurs vérifiés', feat1Desc:'Chaque enseignant est sélectionné pour ses compétences et son expérience.',
      feat2Title:'Accès rapide', feat2Desc:'Accédez à vos cours en toute sécurité..',
      feat3Title:'Apprentissage flexible', feat3Desc:'Étudiez où et quand vous le souhaitez.',
      feat4Title:'Suivi complet', feat4Desc:'Gérez votre emploi du temps et vos devoirs depuis votre tableau de bord.',
      how1Title:'Créer un compte', how1Desc:'Inscription gratuite en moins d\'une minute.',
      how2Title:'Choisir un professeur', how2Desc:'Parcourez par matière et wilaya.',
      how3Title:'Réserver', how3Desc:'Choisissez la date et joignez votre devoir.',
      how4Title:'Accéder aux fichiers', how4Desc:'Téléchargez les leçons et exercices.',
      how5Title:'Apprendre à son rythme', how5Desc:'Rejoignez votre cours via Apprentissage flexible.',
      nextSession:'Prochaine séance', tomorrow:'Demain, 14:00', hwCorrected:'Devoir corrigé', bookNowCard:'Réserver',
    },
    dashboard: {
      title:'Tableau de bord',
      greetMorning:'Bonjour', greetAfternoon:'Bon après-midi', greetEvening:'Bonsoir',
      totalSessions:'Total séances', pending:'En attente', confirmed:'Confirmées', completed:'Terminées',
      recentSessions:'Séances récentes', topTeachers:'Top professeurs',
      noSessions:'Aucune séance', noSessionsDesc:'Réservez votre première séance.',
      findTeacher:'Trouver un professeur', bookNow:'Réserver',
      // Teacher dashboard
      newRequests:'Nouvelles demandes', myStudents:'Mes élèves',
      earnings:'Revenus (DA)', thisMonth:'Ce mois',
      confirmSession:'Confirmer', rejectSession:'Refuser',
      sessionRequests:'Demandes de séances',
      pendingRequests:'Demandes en attente', confirmedSessions:'Séances confirmées',
      quickActions:'Actions rapides', viewEarnings:'Voir les gains', manageAll:'Tout gérer',
    },
    teachers: {
      title:'Professeurs', pageTitle:'Trouver un professeur',
      search:'Rechercher un professeur…', filter:'Filtrer', all:'Toutes',
      noResults:'Aucun professeur trouvé', noResultsDesc:'Essayez d\'autres critères.',
      book:'Réserver', perHour:'/h', sessions:'séances', exp:'ans d\'exp.',
      rating:'Note', viewProfile:'Voir le profil',
    },
    sessions: {
      title:'Mes Séances', newSession:'Nouvelle séance',
      upcoming:'À venir', history:'Historique',
      noSessions:'Aucune séance', noSessionsDesc:'Réservez votre première séance.',
      professor:'Professeur', student:'Élève', subject:'Sujet',
      dateTime:'Date & Heure', duration:'Durée', homework:'Devoir',
      status:'Statut', payment:'Paiement', meetLink:'Lien Meet',
      statusPending:'En attente', statusConfirmed:'Confirmée',
      statusCompleted:'Terminée', statusCancelled:'Annulée',
      payPending:'En vérif.', payPaid:'Payée', payUnpaid:'Non payée',
      consult:'Consulter',
      backToMyCourses:'Retour à mes cours',
      backToCourses:'Retour aux cours',
      courseDetails:'Détails du cours',
      createdOn:'Créé le',
      totalViews:'Vues totales',
      students:'élèves',
      description:'Description',
      includedFiles:'Fichiers inclus',
      download:'Télécharger',
      open:'Ouvrir',
      studentsViewed:'Élèves ayant consulté',
      courseAuthor:'Créateur du cours',
      noStudentsYet:'Aucun élève n\'a encore consulté ce cours.',
    },
    booking: {
      title:'Réserver une séance', backToTeachers:'Retour aux professeurs',
      detailsSection:'Détails de la séance', hwSection:'Devoir (facultatif)',
      teacherLabel:'Professeur *', chooseTeacher:'— Sélectionner —',
      subjectLabel:'Matière / Sujet *', subjectPlaceholder:'Ex: Exercices BAC, Révision…',
      dateLabel:'Date et heure *', durationLabel:'Durée',
      d30:'30 min', d60:'1 heure', d90:'1h 30', d120:'2 heures',
      messageLabel:'Message', messageOpt:'— facultatif',
      messagePlaceholder:'Décrivez votre niveau, vos difficultés…',
      hwDesc:'Joignez votre devoir PDF pour que le professeur puisse le préparer.',
      hwClick:'Cliquez ou glissez votre fichier', hwInfo:'PDF, DOC — max 10 Mo',
      paySection:'Accès rapide',
      payDesc:'Après confirmation du professeur, vous paierez via Dahabia.',
      teacherDahabia:'Numéro Dahabia du professeur',
      yourDahRef:'Votre référence de virement',
      yourDahRefPlaceholder:'Numéro de transaction Dahabia',
      confirm:'Confirmer la réservation',
      successTitle:'Demande envoyée !',
      successDesc:'Le professeur va confirmer votre séance. Vous recevrez une notification.',
      selectFirst:'Sélectionnez un professeur.',
      tarif:'Tarif', perHour:'/ heure', totalSession:'Total session estimé',
    },
    courses: {
      backToMyCourses:'Retour à mes cours',
      createTitle:'Créer un nouveau cours',
      courseCreated:'Cours créé !',
      courseCreatedDesc:'Votre cours a été publié avec succès.',
      redirecting:'Redirection…',
      titleLabel:'Titre du cours',
      titlePlaceholder:'Ex: Algèbre Linéaire - Chapitre 1',
      subjectLabel:'Matière / Module',
      descLabel:'Description (optionnel)',
      descPlaceholder:'Détails du cours…',
      filesLabel:'Fichiers PDF (Leçons, Exercices, Corrigés)',
      uploadCta:'Cliquez pour uploader des PDFs',
      uploadHint:'Taille max : 10MB par fichier',
      publish:'Publier le cours',
      cancel:'Annuler',
    },
    profile: {
      title:'Mon Profil', subtitle:'Gérez vos informations',
      personalInfo:'Informations personnelles', edit:'Modifier', save:'Enregistrer',
      saving:'Enregistrement…', saved:'Profil sauvegardé !',
      name:'Nom complet', email:'Email', level:'Niveau', wilaya:'Wilaya',
      memberSince:'Membre depuis', bio:'Biographie', specialty:'Spécialité',
      experience:'Années d\'expérience', rate:'Tarif horaire (DA)',
      dahabia:'Numéro de contact', dahbia_help:'Optionnel.',
      meetLink:'Lien Apprentissage flexible', meetHelp:'Lien vers votre site personnel.',
      cancel:'Annuler', switchRole:'Changer de rôle',
      dangerZone:'Zone dangereuse',
      deleteDesc:'Supprimez votre compte pour vous reconnecter avec un autre rôle.',
      deleteAccount:'Supprimer mon compte',
      deleteConfirm:'Êtes-vous sûr de vouloir supprimer ce compte',
    },
    about: {
      title:'À propos de Dourous-Net', sub:'Plateforme éducative algérienne',
      desc:'Dourous-Net connecte élèves et professeurs en Algérie. Réservation en ligne, paiement Dahabia, cours en direct via Apprentissage flexible.',
      mission:'Mission', missionDesc:'Rendre l\'éducation accessible à tous les étudiants algériens.',
      security:'Sécurité RLS', securityDesc:'Chaque utilisateur ne voit que ses propres données.',
      payment:'Accès rapide', paymentDesc:'Accédez aux meilleurs supports pédagogiques.',
      meet:'Apprentissage flexible', meetDesc:'Les cours se déroulent en direct via Apprentissage flexible.',
    },
    sessionDetail: {
      title:'Détail de la séance', meetBtn:'Rejoindre le cours',
      confirmPayment:'Confirmer le paiement', paymentInstructions:'Instructions de paiement',
      transferTo:'Virer sur le numéro Dahabia :', amount:'Montant :', enterRef:'Entrez la référence',
      refPlaceholder:'Ex: TXN-20240512-XXXX', submitPayment:'Soumettre le paiement',
      addMeetLink:'Ajouter le lien Meet', linkPlaceholder:'https://meet.google.com/xxx-xxxx-xxx',
      confirmBtn:'Confirmer la séance', rejectBtn:'Refuser',
      paymentReceived:'Marquer payée', leaveReview:'Laisser un avis',
      reviewTitle:'Votre avis', reviewPlaceholder:'Décrivez votre expérience…', rateTeacher:'Évaluez le professeur (sur 5 étoiles)',
      ratingSaved:'Votre note a été enregistrée.',
      submitReview:'Envoyer l\'avis',
    },
  },
  en: {
    common: { loading:'Loading…', save:'Save', cancel:'Cancel', edit:'Edit',
      delete:'Delete', confirm:'Confirm', back:'Back', or:'or', search:'Search',
      copyright:'© 2026 Dourous-Net — Algeria', yes:'Yes', no:'No', close:'Close',
      perHour:'/hour', onRequest:'On request', viewAll:'View all', notFound:'Not found' },
    theme: { light:'Light', dark:'Dark', appearance:'Appearance', color:'Color', lang:'Language' },
    nav: { dashboard:'Dashboard', teachers:'Teachers', sessions:'My sessions',
      profile:'My profile', about:'About', logout:'Sign out', menu:'Menu',
      mySessions:'My sessions', myStudents:'My students', myProfile:'My profile', myCourses:'My courses' },
    auth: {
      loginTitle:'Sign in', registerTitle:'Create account',
      email:'Email address', password:'Password', fullName:'Full name',
      confirmPassword:'Confirm password',
      noAccount:'No account yet?', hasAccount:'Already registered?',
      createAccount:'Create account', loginLink:'Sign in',
      minPw:'min. 8 characters', submit:'Sign in', submitReg:'Create account',
      successTitle:'Account created!',
      successDesc:'Check your email to confirm, then sign in.',
      goLogin:'Go to sign in', wrongCreds:'Incorrect email or password.',
      terms:'By registering, you accept our terms of use.',
      configHint:'⚙️ Supabase → Auth → URL Config → Site URL = http://localhost:3000',
      chooseRole:'I am…', student:'Student', teacher:'Teacher',
      studentDesc:'I\'m looking for private lessons', teacherDesc:'I give private lessons',
      wilaya:'Wilaya', level:'School level', specialty:'Subject taught',
      loginDesc:'Sign in to access your sessions and teachers.',
      welcomeBack:'Welcome back',
      loginRoleWarning:'Detected login as:',
      confirmLoginRole:'Are you sure you want to login as',
    },
    landing: {
      badge:'Education platform — Algeria',
      title:'The best private lesson, online.',
      sub:'Connect students and teachers in Algeria. Book, access the best courses and learn at your own pace.',
      start:'Get started', login:'Sign in', signup:'Sign up',
      activeProfessors:'Active teachers', sessionsCompleted:'Sessions completed', subjects:'Subjects',
      howTitle:'How it works?', whyTitle:'Why Dourous-Net?',
      whySub:'A platform designed for the success of Algerian students.',
      ctaTitle:'Ready to improve?', ctaBtn:'Create my free account',
      trust1:'Free registration', trust2:'Fast access', trust3:'Apprentissage flexible sessions',
      feat1Title:'Verified teachers', feat1Desc:'Each teacher is selected for their skills and experience.',
      feat2Title:'Fast access', feat2Desc:'Access your courses securely.',
      feat3Title:'Apprentissage flexible', feat3Desc:'Study whenever and wherever you want.',
      feat4Title:'Full tracking', feat4Desc:'Manage your schedule and homework from your dashboard.',
      how1Title:'Create account', how1Desc:'Free registration in under a minute.',
      how2Title:'Choose a teacher', how2Desc:'Browse by subject and wilaya.',
      how3Title:'Book', how3Desc:'Choose date and attach your homework.',
      how4Title:'Access files', how4Desc:'Download lessons and exercises.',
      how5Title:'Learn at your pace', how5Desc:'Join your class via Apprentissage flexible.',
      nextSession:'Next session', tomorrow:'Tomorrow, 14:00', hwCorrected:'Homework corrected', bookNowCard:'Book now',
    },
    dashboard: {
      title:'Dashboard',
      greetMorning:'Good morning', greetAfternoon:'Good afternoon', greetEvening:'Good evening',
      totalSessions:'Total sessions', pending:'Pending', confirmed:'Confirmed', completed:'Completed',
      recentSessions:'Recent sessions', topTeachers:'Top teachers',
      noSessions:'No sessions', noSessionsDesc:'Book your first session.',
      findTeacher:'Find a teacher', bookNow:'Book',
      newRequests:'New requests', myStudents:'My students',
      earnings:'Earnings (DA)', thisMonth:'This month',
      confirmSession:'Confirm', rejectSession:'Reject',
      sessionRequests:'Session requests',
      pendingRequests:'Pending requests', confirmedSessions:'Confirmed sessions',
      quickActions:'Quick actions', viewEarnings:'View earnings', manageAll:'Manage all',
    },
    teachers: {
      title:'Teachers', pageTitle:'Find a teacher',
      search:'Search a teacher…', filter:'Filter', all:'All',
      noResults:'No teachers found', noResultsDesc:'Try different criteria.',
      book:'Book', perHour:'/h', sessions:'sessions', exp:'yrs exp.',
      rating:'Rating', viewProfile:'View profile',
    },
    sessions: {
      title:'My Sessions', newSession:'New session',
      upcoming:'Upcoming', history:'History',
      noSessions:'No sessions', noSessionsDesc:'Book your first session.',
      professor:'Teacher', student:'Student', subject:'Subject',
      dateTime:'Date & Time', duration:'Duration', homework:'Homework',
      status:'Status', payment:'Payment', meetLink:'Meet link',
      statusPending:'Pending', statusConfirmed:'Confirmed',
      statusCompleted:'Completed', statusCancelled:'Cancelled',
      payPending:'Verifying', payPaid:'Paid', payUnpaid:'Unpaid',
      consult:'Consult',
      backToMyCourses:'Back to my courses',
      backToCourses:'Back to courses',
      courseDetails:'Course details',
      createdOn:'Created on',
      totalViews:'Total views',
      students:'students',
      description:'Description',
      includedFiles:'Included files',
      download:'Download',
      open:'Open',
      studentsViewed:'Students who viewed',
      courseAuthor:'Course author',
      noStudentsYet:'No students have viewed this course yet.',
    },
    booking: {
      title:'Book a session', backToTeachers:'Back to teachers',
      detailsSection:'Session details', hwSection:'Homework (optional)',
      teacherLabel:'Teacher *', chooseTeacher:'— Select a teacher —',
      subjectLabel:'Subject *', subjectPlaceholder:'E.g.: BAC exercises, revision…',
      dateLabel:'Date & time *', durationLabel:'Duration',
      d30:'30 min', d60:'1 hour', d90:'1h 30', d120:'2 hours',
      messageLabel:'Message', messageOpt:'— optional',
      messagePlaceholder:'Describe your level, your difficulties…',
      hwDesc:'Attach your homework PDF so the teacher can prepare.',
      hwClick:'Click or drag your file', hwInfo:'PDF, DOC — max 10 MB',
      paySection:'Dahabia Payment',
      payDesc:'After teacher confirmation, you will pay via Dahabia.',
      teacherDahabia:'Teacher\'s Dahabia number',
      yourDahRef:'Your transfer reference',
      yourDahRefPlaceholder:'Dahabia transaction number',
      confirm:'Confirm booking',
      successTitle:'Request sent!',
      successDesc:'The teacher will confirm your session. You\'ll be notified.',
      selectFirst:'Select a teacher.',
      tarif:'Rate', perHour:'/ hour', totalSession:'Estimated session total',
    },
    courses: {
      backToMyCourses:'Back to my courses',
      createTitle:'Create a new course',
      courseCreated:'Course created!',
      courseCreatedDesc:'Your course has been published successfully.',
      redirecting:'Redirecting…',
      titleLabel:'Course title',
      titlePlaceholder:'E.g.: Linear Algebra — Chapter 1',
      subjectLabel:'Subject / Module',
      descLabel:'Description (optional)',
      descPlaceholder:'Course details…',
      filesLabel:'PDF files (Lessons, Exercises, Solutions)',
      uploadCta:'Click to upload PDFs',
      uploadHint:'Max size: 10MB per file',
      publish:'Publish course',
      cancel:'Cancel',
    },
    profile: {
      title:'My Profile', subtitle:'Manage your information',
      personalInfo:'Personal information', edit:'Edit', save:'Save',
      saving:'Saving…', saved:'Profile saved!',
      name:'Full name', email:'Email', level:'Level', wilaya:'Wilaya',
      memberSince:'Member since', bio:'Biography', specialty:'Specialty',
      experience:'Years of experience', rate:'Hourly rate (DA)',
      dahabia:'Contact number', dahbia_help:'Optional.',
      meetLink:'Apprentissage flexible link', meetHelp:'Link to your personal website.',
      cancel:'Cancel', switchRole:'Switch Role',
      dangerZone:'Danger zone',
      deleteDesc:'Delete your account if you want to login again with another role.',
      deleteAccount:'Delete my account',
      deleteConfirm:'Are you sure you want to delete this account',
    },
    about: {
      title:'About Dourous-Net', sub:'Algerian education platform',
      desc:'Dourous-Net connects students and teachers in Algeria. Online booking, Fast access, live lessons via Apprentissage flexible.',
      mission:'Mission', missionDesc:'Make education accessible to all Algerian students.',
      security:'RLS Security', securityDesc:'Each user only sees their own data.',
      payment:'Dahabia Payment', paymentDesc:'Access the best educational materials.',
      meet:'Apprentissage flexible', meetDesc:'Lessons take place live via Apprentissage flexible.',
    },
    sessionDetail: {
      title:'Session detail', meetBtn:'Join the lesson',
      confirmPayment:'Confirm payment', paymentInstructions:'Payment instructions',
      transferTo:'Transfer to Dahabia number:', amount:'Amount:', enterRef:'Enter reference',
      refPlaceholder:'E.g.: TXN-20240512-XXXX', submitPayment:'Submit payment',
      addMeetLink:'Add Meet link', linkPlaceholder:'https://meet.google.com/xxx-xxxx-xxx',
      confirmBtn:'Confirm session', rejectBtn:'Reject',
      paymentReceived:'Mark as paid', leaveReview:'Leave a review',
      reviewTitle:'Your review', reviewPlaceholder:'Describe your experience…', rateTeacher:'Rate the teacher (out of 5 stars)',
      ratingSaved:'Your rating has been saved.',
      submitReview:'Submit review',
    },
  },
  ar: {
    common: { loading:'جارٍ التحميل…', save:'حفظ', cancel:'إلغاء', edit:'تعديل',
      delete:'حذف', confirm:'تأكيد', back:'رجوع', or:'أو', search:'بحث',
      copyright:'© 2026 دروس نت — الجزائر', yes:'نعم', no:'لا', close:'إغلاق',
      perHour:'/ساعة', onRequest:'عند الطلب', viewAll:'عرض الكل', notFound:'غير موجود' },
    theme: { light:'فاتح', dark:'داكن', appearance:'المظهر', color:'اللون', lang:'اللغة' },
    nav: { dashboard:'لوحة التحكم', teachers:'الأساتذة', sessions:'جلساتي',
      profile:'ملفي', about:'حول', logout:'تسجيل الخروج', menu:'القائمة',
      mySessions:'جلساتي', myStudents:'طلابي', myProfile:'ملفي الشخصي', myCourses:'دروسي' },
    auth: {
      loginTitle:'تسجيل الدخول', registerTitle:'إنشاء حساب',
      email:'البريد الإلكتروني', password:'كلمة المرور', fullName:'الاسم الكامل',
      confirmPassword:'تأكيد كلمة المرور',
      noAccount:'ليس لديك حساب؟', hasAccount:'لديك حساب بالفعل؟',
      createAccount:'إنشاء حساب', loginLink:'تسجيل الدخول',
      minPw:'8 أحرف على الأقل', submit:'دخول', submitReg:'إنشاء الحساب',
      successTitle:'تم إنشاء الحساب!',
      successDesc:'تحقق من بريدك الإلكتروني ثم سجّل دخولك.',
      goLogin:'الذهاب لتسجيل الدخول', wrongCreds:'بريد إلكتروني أو كلمة مرور غير صحيحة.',
      terms:'بالتسجيل، أنت توافق على شروط الاستخدام.',
      configHint:'⚙️ Supabase → Auth → URL Config → Site URL = http://localhost:3000',
      chooseRole:'أنا…', student:'طالب / تلميذ', teacher:'أستاذ',
      studentDesc:'أبحث عن دروس خصوصية', teacherDesc:'أقدم دروساً خصوصية',
      wilaya:'الولاية', level:'المستوى الدراسي', specialty:'المادة التي تدرّسها',
      loginDesc:'سجّل دخولك للوصول إلى جلساتك وأساتذتك.',
      welcomeBack:'مرحباً بعودتك',
      loginRoleWarning:'تم اكتشاف تسجيل الدخول كـ:',
      confirmLoginRole:'هل أنت متأكد أنك تريد تسجيل الدخول كـ',
    },
    landing: {
      badge:'منصة تعليمية — الجزائر',
      title:'أفضل دروس خصوصية، عبر الإنترنت.',
      sub:'ربط الطلاب بالأساتذة في الجزائر. احجز، احصل على أفضل الدروس وتعلم بالوتيرة التي تناسبك.',
      start:'ابدأ الآن', login:'دخول', signup:'تسجيل',
      activeProfessors:'أستاذ نشط', sessionsCompleted:'جلسة مكتملة', subjects:'مادة',
      howTitle:'كيف يعمل؟', whyTitle:'لماذا دروس نت؟',
      whySub:'منصة مصممة لنجاح الطلاب الجزائريين.',
      ctaTitle:'مستعد للتقدم؟', ctaBtn:'إنشاء حساب مجاني',
      trust1:'تسجيل مجاني', trust2:'وصول سريع', trust3:'جلسات Apprentissage flexible',
      feat1Title:'أساتذة معتمدون', feat1Desc:'يتم اختيار كل معلم لمهاراته وخبراته.',
      feat2Title:'الوصول سريع', feat2Desc:'قم بالوصول إلى دروسك بأمان.',
      feat3Title:'Apprentissage flexible', feat3Desc:'ادرس في أي وقت وأي مكان.',
      feat4Title:'متابعة كاملة', feat4Desc:'أدر جدولك الزمني وواجباتك من لوحة التحكم.',
      how1Title:'إنشاء حساب', how1Desc:'تسجيل مجاني في أقل من دقيقة.',
      how2Title:'اختر أستاذاً', how2Desc:'تصفح حسب المادة والولاية.',
      how3Title:'احجز', how3Desc:'اختر التاريخ وأرفق واجبك.',
      how4Title:'اوصول سريع', how4Desc:'حمل الدروس والتمارين.',
      how5Title:'تعلم بالوتيرة الخاصة بك', how5Desc:'انضم لدرسك عبر Apprentissage flexible.',
      nextSession:'الجلسة القادمة', tomorrow:'غداً، 14:00', hwCorrected:'تم تصحيح الواجب', bookNowCard:'احجز الآن',
    },
    dashboard: {
      title:'لوحة التحكم',
      greetMorning:'صباح الخير', greetAfternoon:'مساء الخير', greetEvening:'مساء النور',
      totalSessions:'إجمالي الجلسات', pending:'في الانتظار', confirmed:'مؤكدة', completed:'مكتملة',
      recentSessions:'الجلسات الأخيرة', topTeachers:'أفضل الأساتذة',
      noSessions:'لا توجد جلسات', noSessionsDesc:'احجز أول جلسة لك.',
      findTeacher:'ابحث عن أستاذ', bookNow:'احجز',
      newRequests:'طلبات جديدة', myStudents:'طلابي',
      earnings:'الأرباح (دج)', thisMonth:'هذا الشهر',
      confirmSession:'تأكيد', rejectSession:'رفض',
      sessionRequests:'طلبات الجلسات',
      pendingRequests:'الطلبات المعلقة', confirmedSessions:'الجلسات المؤكدة',
      quickActions:'إجراءات سريعة', viewEarnings:'عرض الأرباح', manageAll:'إدارة الكل',
    },
    teachers: {
      title:'الأساتذة', pageTitle:'ابحث عن أستاذ',
      search:'ابحث عن أستاذ…', filter:'تصفية', all:'الكل',
      noResults:'لا يوجد أساتذة', noResultsDesc:'جرّب معايير أخرى.',
      book:'احجز', perHour:'/س', sessions:'جلسات', exp:'سنوات خبرة',
      rating:'التقييم', viewProfile:'عرض الملف',
    },
    sessions: {
      title:'جلساتي', newSession:'جلسة جديدة',
      upcoming:'القادمة', history:'السجل',
      noSessions:'لا توجد جلسات', noSessionsDesc:'احجز أول جلسة.',
      professor:'الأستاذ', student:'الطالب', subject:'الموضوع',
      dateTime:'التاريخ والوقت', duration:'المدة', homework:'الواجب',
      status:'الحالة', payment:'الدفع', meetLink:'رابط Meet',
      statusPending:'في الانتظار', statusConfirmed:'مؤكدة',
      statusCompleted:'مكتملة', statusCancelled:'ملغاة',
      payPending:'قيد التحقق', payPaid:'مدفوعة', payUnpaid:'غير مدفوعة',
      consult:'عرض',
      backToMyCourses:'العودة إلى دروسي',
      backToCourses:'العودة للدروس',
      courseDetails:'تفاصيل الدرس',
      createdOn:'تاريخ الإنشاء',
      totalViews:'إجمالي المشاهدات',
      students:'طلاب',
      description:'الوصف',
      includedFiles:'الملفات المرفقة',
      download:'تحميل',
      open:'فتح',
      studentsViewed:'الطلاب الذين شاهدوا',
      courseAuthor:'مُنشئ الدرس',
      noStudentsYet:'لم يشاهد أي طالب هذا الدرس بعد.',
    },
    booking: {
      title:'حجز جلسة', backToTeachers:'العودة للأساتذة',
      detailsSection:'تفاصيل الجلسة', hwSection:'الواجب (اختياري)',
      teacherLabel:'الأستاذ *', chooseTeacher:'— اختر أستاذاً —',
      subjectLabel:'المادة / الموضوع *', subjectPlaceholder:'مثال: تمارين الباك، مراجعة…',
      dateLabel:'التاريخ والوقت *', durationLabel:'المدة',
      d30:'30 دقيقة', d60:'ساعة', d90:'ساعة ونصف', d120:'ساعتان',
      messageLabel:'رسالة', messageOpt:'— اختياري',
      messagePlaceholder:'صف مستواك وصعوباتك…',
      hwDesc:'أرفق ملف PDF للواجب ليتمكن الأستاذ من التحضير.',
      hwClick:'انقر أو اسحب ملفك', hwInfo:'PDF, DOC — 10 ميغا بايت كحد أقصى',
      paySection:'الوصول سريع',
      payDesc:'بعد تأكيد الأستاذ، ستدفع عبر الداهبية.',
      teacherDahabia:'رقم هاتف الأستاذ',
      yourDahRef:'مرجع التحويل',
      yourDahRefPlaceholder:'رقم معاملة الداهبية',
      confirm:'تأكيد الحجز',
      successTitle:'تم إرسال الطلب!',
      successDesc:'سيقوم الأستاذ بتأكيد جلستك.',
      selectFirst:'اختر أستاذاً أولاً.',
      tarif:'السعر', perHour:'/ ساعة', totalSession:'إجمالي الجلسة',
    },
    courses: {
      backToMyCourses:'العودة إلى دروسي',
      createTitle:'إنشاء درس جديد',
      courseCreated:'تم إنشاء الدرس!',
      courseCreatedDesc:'تم نشر الدرس بنجاح.',
      redirecting:'جارٍ التحويل…',
      titleLabel:'عنوان الدرس',
      titlePlaceholder:'مثال: الجبر الخطي — الفصل 1',
      subjectLabel:'المادة / الوحدة',
      descLabel:'الوصف (اختياري)',
      descPlaceholder:'تفاصيل الدرس…',
      filesLabel:'ملفات PDF (دروس، تمارين، حلول)',
      uploadCta:'انقر لرفع ملفات PDF',
      uploadHint:'الحجم الأقصى: 10MB لكل ملف',
      publish:'نشر الدرس',
      cancel:'إلغاء',
    },
    profile: {
      title:'ملفي الشخصي', subtitle:'إدارة معلوماتك',
      personalInfo:'المعلومات الشخصية', edit:'تعديل', save:'حفظ',
      saving:'جارٍ الحفظ…', saved:'تم حفظ الملف!',
      name:'الاسم الكامل', email:'البريد الإلكتروني', level:'المستوى', wilaya:'الولاية',
      memberSince:'عضو منذ', bio:'السيرة الذاتية', specialty:'التخصص',
      experience:'سنوات الخبرة', rate:'السعر بالساعة (دج)',
      dahabia:'رقم الهاتف', dahbia_help:'اختياري.',
      meetLink:'رابط Apprentissage flexible', meetHelp:'رابط لموقعك الشخصي.',
      cancel:'إلغاء', switchRole:'تغيير الدور',
      dangerZone:'منطقة خطيرة',
      deleteDesc:'احذف حسابك إذا أردت تسجيل الدخول من جديد بدور مختلف.',
      deleteAccount:'حذف حسابي',
      deleteConfirm:'هل أنت متأكد أنك تريد حذف هذا الحساب',
    },
    about: {
      title:'حول دروس نت', sub:'منصة تعليمية جزائرية',
      desc:'دروس نت يربط الطلاب بالأساتذة في الجزائر. حجز إلكتروني، وصول سريع، دروس مباشرة عبر Apprentissage flexible.',
      mission:'المهمة', missionDesc:'جعل التعليم في متناول جميع الطلاب الجزائريين.',
      security:'أمان RLS', securityDesc:'كل مستخدم يرى بياناته فقط.',
      payment:'الوصول سريع', paymentDesc:'وصول لأفضل المواد التعليمية.',
      meet:'Apprentissage flexible', meetDesc:'تُعقد الدروس مباشرة عبر Apprentissage flexible.',
    },
    sessionDetail: {
      title:'تفاصيل الجلسة', meetBtn:'الانضمام للدرس',
      confirmPayment:'تأكيد الدفع', paymentInstructions:'تعليمات الدفع',
      transferTo:'حوّل على رقم الداهبية:', amount:'المبلغ:', enterRef:'أدخل المرجع',
      refPlaceholder:'مثال: TXN-20240512-XXXX', submitPayment:'إرسال الدفع',
      addMeetLink:'إضافة رابط Meet', linkPlaceholder:'https://meet.google.com/xxx-xxxx-xxx',
      confirmBtn:'تأكيد الجلسة', rejectBtn:'رفض',
      paymentReceived:'تحديد كمدفوعة', leaveReview:'اترك تقييماً',
      reviewTitle:'تقييمك', reviewPlaceholder:'صف تجربتك…', rateTeacher:'قيّم الأستاذ (من 5 نجوم)',
      ratingSaved:'تم حفظ تقييمك بنجاح.',
      submitReview:'إرسال التقييم',
    },
  },
}

interface UiCtx {
  theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void
  lang: Lang; setLang: (l: Lang) => void
  accent: string; setAccent: (a: string) => void
  t: (section: string, key: string) => string
  tData: (val: string) => string
  isRTL: boolean
  ACCENT_COLORS: typeof ACCENT_COLORS
}

const Ctx = createContext<UiCtx | null>(null)

function stored(key: string, fallback: string, valid: string[]): string {
  if (typeof window === 'undefined') return fallback
  const v = localStorage.getItem(key)
  return v && valid.includes(v) ? v : fallback
}

function applyAccent(key: string, theme: Theme) {
  const a   = ACCENT_COLORS[key] ?? ACCENT_COLORS.blue
  const hex = theme === 'dark' ? a.dark : a.hex
  const r   = document.documentElement
  r.style.setProperty('--primary',        hex)
  r.style.setProperty('--primary-shadow', a.shadow)
  r.style.setProperty('--primary-soft',   hex + '18')
  r.style.setProperty('--sidebar-active', hex + '20')
}

export function UiProvider({ children, initialLang = 'fr' }: { children: ReactNode, initialLang?: Lang }) {
  const router = useRouter()
  const [theme,  setThemeS]  = useState<Theme>(() => stored(THEME_KEY,  'light', ['light','dark']) as Theme)
  const [lang,   setLangS]   = useState<Lang>(initialLang)
  const [accent, setAccentS] = useState(() => stored(ACCENT_KEY, 'blue', Object.keys(ACCENT_COLORS)))
  const didMount = useRef(false)

  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark')
    html.removeAttribute('data-theme')
    if (theme === 'dark') { html.classList.add('dark'); html.setAttribute('data-theme','dark') }
    else html.setAttribute('data-theme','light')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useLayoutEffect(() => {
    applyAccent(accent, theme)
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent, theme])

  // On mount, sync lang from localStorage (deferred to avoid hydration mismatch)
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      const saved = localStorage.getItem(LANG_KEY)
      if (saved && ['fr','en','ar'].includes(saved) && saved !== lang) {
        setLangS(saved as Lang)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem(LANG_KEY, lang)
    // Also set cookie so Server Components can read it
    document.cookie = `${LANG_KEY}=${lang};path=/;max-age=31536000;samesite=lax`
  }, [lang])

  const setTheme    = (v: Theme)  => setThemeS(['light','dark'].includes(v) ? v : 'light' as Theme)
  const setLang = (v: Lang) => {
    const next = ['fr', 'en', 'ar'].includes(v) ? v : 'fr' as Lang
    setLangS(next)
    document.cookie = `${LANG_KEY}=${next};path=/;max-age=31536000;samesite=lax`
    localStorage.setItem(LANG_KEY, next)
    // Refresh Server Components without a full reload
    router.refresh()
  }
  const setAccent   = (v: string) => setAccentS(ACCENT_COLORS[v] ? v : 'blue')
  const toggleTheme = () => setThemeS(p => p === 'light' ? 'dark' : 'light')
  const isRTL       = lang === 'ar'

  function t(section: string, key: string): string {
    return (T[lang]?.[section]?.[key]) ?? (T.fr[section]?.[key]) ?? key
  }
  function tData(val: string): string {
    return translateData(val, lang)
  }

  return (
    <Ctx.Provider value={{ theme, setTheme, toggleTheme, lang, setLang, accent, setAccent, t, tData, isRTL, ACCENT_COLORS }}>
      {children}
    </Ctx.Provider>
  )
}

export function useUi() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUi must be inside UiProvider')
  return ctx
}

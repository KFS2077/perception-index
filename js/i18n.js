// Categories 
const categories = {
    en: {
        tech: "Technology",
        education: "Education",
        healthcare: "Healthcare",
        arts: "Arts",
        business: "Business",
        service: "Service",
        other: "Other"
    },
    zh: {
        tech: "科技",
        education: "教育",
        healthcare: "医疗",
        arts: "艺术",
        business: "商业",
        service: "服务",
        other: "其他"
    },
    es: {
        tech: "Tecnología",
        education: "Educación",
        healthcare: "Salud",
        arts: "Artes",
        business: "Negocios",
        service: "Servicios",
        other: "Otros"
    },
    fr: {
        tech: "Technologie",
        education: "Éducation",
        healthcare: "Santé",
        arts: "Arts",
        business: "Affaires",
        service: "Service",
        other: "Autre"
    },
    de: {
        tech: "Technologie",
        education: "Bildung",
        healthcare: "Gesundheitswesen",
        arts: "Kunst",
        business: "Wirtschaft",
        service: "Dienstleistung",
        other: "Sonstiges"
    },
    ja: {
        tech: "テクノロジー",
        education: "教育",
        healthcare: "医療",
        arts: "芸術",
        business: "ビジネス",
        service: "サービス",
        other: "その他"
    }
};

// Language translations
const translations = {
    en: {
        // Nav
        title: "AGI Perception Index - Perception of AI by Different Professions",
        navTitle: "AGI Perception Index",
        // Sidebar navigation
        navHome: "Home",
        navStats: "Statistics",
        navProfessions: "Professions",
        navComments: "Comments",
        navAnalysis: "Analysis",
        navActivity: "Activity",
        // Hero
        heroTitle: "Artificial Intelligence Perception Index",
        heroSubtitle: "Explore how different professions perceive AI",
        searchPlaceholder: "Search professions...",
        // Dashboard
        totalVotes: "Total Votes",
        avgPerception: "Average Perception Index",
        professionCount: "Professions Covered",
        // Sections
        popularProfessions: "Popular Professions",
        addProfession: "Add Profession",
        loading: "Loading...",
        dataAnalysis: "Data Analysis",
        categoryDistribution: "Profession Category Distribution",
        perceptionDistribution: "Perception Index Distribution",
        realtimeActivity: "Real-time Activity",
        commentsWall: "Comments Wall",
        // Profession details modal
        agiAwarenessQuestion: "How does this profession perceive AGI?",
        sliderInstruction: "Drag the slider to select your assessment of this profession's perception of AGI",
        levelBasic: "Initial Contact (0-25%)",
        levelBasicDesc: "Can only perform specific tasks under human guidance",
        levelIntermediate: "Basic Cognition (26-50%)",
        levelIntermediateDesc: "Has multi-domain capabilities but still needs human assistance",
        levelAdvanced: "Practical Application (51-75%)",
        levelAdvancedDesc: "Shows autonomous learning abilities, approaching human level",
        levelExpert: "Deep Understanding (76-100%)",
        levelExpertDesc: "Has general intelligence, can solve complex problems autonomously",
        submitRating: "Submit Rating",
        currentRating: "Current Rating",
        ratingParticipants: "Rating Participants",
        // Add profession modal
        addNewProfession: "Add New Profession",
        professionCategory: "Profession Category",
        selectCategory: "Please select a category",
        professionName: "Profession Name",
        professionNamePlaceholder: "Enter profession name",
        professionDescription: "Profession Description",
        professionDescriptionPlaceholder: "Briefly describe this profession (optional)",
        submit: "Submit",
        cancel: "Cancel",
        // Comments
        commentsBoard: "Comments Board",
        shareYourThoughts: "Share your thoughts...",
        sendComment: "Send",
        noComments: "No comments yet. Be the first to comment!",
        // Messages
        ratingSuccess: "Rating submitted successfully!",
        ratingError: "Error submitting rating. Please try again.",
        submittingRating: "Submitting your rating...",
        commentSuccess: "Comment Submitted",
        commentSaved: "Your comment has been saved",
        commentError: "Error",
        commentFailed: "Could not save your comment. Please try again.",
        // New translations for features
        noData: "No data available",
        loadFailed: "Loading failed, please refresh",
        loadMoreFailed: "Failed to load more professions, please refresh",
        alreadyVoted: "You have already voted for this profession",
        voteRegistered: "Your vote has been registered",
        ratings: "ratings",
        comments: "comments",
        more: "More...",
        // Add Profession Form Messages
        formError: "Please fill in the profession category and name",
        addSuccess: "Success",
        professionAdded: "Profession added successfully!",
        addError: "Failed to add profession, please try again",
        // Loading text from landing page
        loadingResources: "Loading resources...",
        initializingDatabase: "Initializing database connection...",
        loadingStatistics: "Loading statistics data...",
        preparingData: "Preparing professions data...",
        initializingCharts: "Initializing charts...",
        loadingActivityFeed: "Loading activity feed...",
        finalizing: "Finalizing..."
    },
    zh: {
        // Nav
        title: "AGI感知指数 - 不同职业对AI的感知度",
        navTitle: "AGI感知指数",
        // Sidebar navigation
        navHome: "首页",
        navStats: "统计",
        navProfessions: "职业",
        navComments: "留言",
        navAnalysis: "分析",
        navActivity: "活动",
        // Hero
        heroTitle: "人工智能感知指数",
        heroSubtitle: "探索不同职业人群对AI的感知程度",
        searchPlaceholder: "搜索职业...",
        // Dashboard
        totalVotes: "总投票数",
        avgPerception: "平均感知指数",
        professionCount: "覆盖职业数",
        // Sections
        popularProfessions: "热门职业",
        addProfession: "添加职业",
        loading: "加载中...",
        dataAnalysis: "数据分析",
        categoryDistribution: "职业类别分布",
        perceptionDistribution: "感知指数分布",
        realtimeActivity: "实时动态",
        commentsWall: "留言墙",
        // Profession details modal
        agiAwarenessQuestion: "这个职业如何感知AGI？",
        sliderInstruction: "拖动滑块选择您对该职业AI感知程度的评估",
        levelBasic: "初步接触 (0-25%)",
        levelBasicDesc: "只能在人类指导下执行特定任务",
        levelIntermediate: "基础认知 (26-50%)",
        levelIntermediateDesc: "具备多领域能力，但仍需人类辅助",
        levelAdvanced: "实际应用 (51-75%)",
        levelAdvancedDesc: "展现自主学习能力，接近人类水平",
        levelExpert: "深度理解 (76-100%)",
        levelExpertDesc: "具备通用智能，能自主解决复杂问题",
        submitRating: "提交评分",
        currentRating: "当前评分",
        ratingParticipants: "参与评分人数",
        // Add profession modal
        addNewProfession: "添加新职业",
        professionCategory: "职业类别",
        selectCategory: "请选择类别",
        professionName: "职业名称",
        professionNamePlaceholder: "输入职业名称",
        professionDescription: "职业描述",
        professionDescriptionPlaceholder: "简要描述这个职业（可选）",
        submit: "提交",
        cancel: "取消",
        // Comments
        commentsBoard: "评论区",
        shareYourThoughts: "分享您的想法...",
        sendComment: "发送",
        noComments: "暂无评论。成为第一个评论的人！",
        // Messages
        ratingSuccess: "评分提交成功！",
        ratingError: "评分提交失败，请重试。",
        submittingRating: "正在提交评分...",
        commentSuccess: "评论已提交",
        commentSaved: "您的评论已保存",
        commentError: "错误",
        commentFailed: "无法保存您的评论，请重试。",
        // New translations for features
        noData: "暂无数据",
        loadFailed: "加载失败，请刷新",
        loadMoreFailed: "加载更多职业失败，请刷新页面",
        alreadyVoted: "您已经为这个职业投过票了",
        voteRegistered: "您的投票已记录",
        ratings: "个评分",
        comments: "条评论",
        more: "更多...",
        // Add Profession Form Messages
        formError: "请填写职业类别和名称",
        addSuccess: "成功",
        professionAdded: "职业添加成功！",
        addError: "添加职业失败，请重试",
        // Loading text from landing page
        loadingResources: "加载资源中...",
        initializingDatabase: "初始化数据库连接...",
        loadingStatistics: "加载统计数据...",
        preparingData: "准备职业数据...",
        initializingCharts: "初始化图表...",
        loadingActivityFeed: "加载活动信息...",
        finalizing: "完成中..."
    },
    es: {
        // Nav
        title: "Índice de Percepción AGI - Percepción de IA por Diferentes Profesiones",
        navTitle: "Índice de Percepción AGI",
        // Sidebar navigation
        navHome: "Inicio",
        navStats: "Estadísticas",
        navProfessions: "Profesiones",
        navComments: "Comentarios",
        navAnalysis: "Análisis",
        navActivity: "Actividad",
        // Hero
        heroTitle: "Índice de Percepción de Inteligencia Artificial",
        heroSubtitle: "Explora cómo diferentes profesiones perciben la IA",
        searchPlaceholder: "Buscar profesiones...",
        // Dashboard
        totalVotes: "Votos Totales",
        avgPerception: "Índice de Percepción Promedio",
        professionCount: "Profesiones Cubiertas",
        // Sections
        popularProfessions: "Profesiones Populares",
        addProfession: "Añadir Profesión",
        loading: "Cargando...",
        dataAnalysis: "Análisis de Datos",
        categoryDistribution: "Distribución de Categorías Profesionales",
        perceptionDistribution: "Distribución del Índice de Percepción",
        realtimeActivity: "Actividad en Tiempo Real",
        // Profession details modal
        agiAwarenessQuestion: "¿Cómo percibe esta profesión la AGI?",
        sliderInstruction: "Arrastra el control deslizante para seleccionar tu evaluación de la percepción de AGI en esta profesión",
        levelBasic: "Contacto Inicial (0-25%)",
        levelBasicDesc: "Solo puede realizar tareas específicas bajo guía humana",
        levelIntermediate: "Cognición Básica (26-50%)",
        levelIntermediateDesc: "Tiene capacidades multidisciplinarias pero aún necesita asistencia humana",
        levelAdvanced: "Aplicación Práctica (51-75%)",
        levelAdvancedDesc: "Muestra capacidades de aprendizaje autónomo, cercano al nivel humano",
        levelExpert: "Comprensión Profunda (76-100%)",
        levelExpertDesc: "Posee inteligencia general, puede resolver problemas complejos autónomamente",
        submitRating: "Enviar Calificación",
        currentRating: "Calificación Actual",
        ratingParticipants: "Participantes en la Calificación",
        // Add profession modal
        addNewProfession: "Añadir Nueva Profesión",
        professionCategory: "Categoría Profesional",
        selectCategory: "Por favor selecciona una categoría",
        professionName: "Nombre de la Profesión",
        professionNamePlaceholder: "Introduce el nombre de la profesión",
        professionDescription: "Descripción de la Profesión",
        professionDescriptionPlaceholder: "Describe las principales responsabilidades y características de esta profesión (opcional)",
        submit: "Enviar",
        cancel: "Cancelar",
        // Comments
        commentsBoard: "Tablero de comentarios",
        shareYourThoughts: "Comparte tus pensamientos...",
        sendComment: "Enviar comentario",
        noComments: "No hay comentarios. Sé el primero en comentar.",
        // Messages
        ratingSuccess: "Calificación enviada con éxito.",
        ratingError: "Error al enviar calificación. Por favor, inténtalo de nuevo.",
        submittingRating: "Enviando tu calificación...",
        commentSuccess: "Comentario enviado",
        commentSaved: "Tu comentario ha sido guardado",
        commentError: "Error",
        commentFailed: "No se pudo guardar tu comentario. Por favor, inténtalo de nuevo.",
        // New translations for features
        noData: "No hay datos disponibles",
        loadFailed: "Carga fallida, por favor refresca",
        loadMoreFailed: "Falló la carga de más profesiones, por favor refresca la página",
        alreadyVoted: "Ya has votado por esta profesión",
        voteRegistered: "Tu voto ha sido registrado",
        ratings: "calificaciones",
        comments: "comentarios",
        more: "Más...",
        // Add Profession Form Messages
        formError: "Por favor completa la categoría y el nombre de la profesión",
        addSuccess: "Éxito",
        professionAdded: "¡Profesión añadida con éxito!",
        addError: "Error al añadir la profesión, por favor inténtalo de nuevo",
        // Loading text from landing page
        loadingResources: "Cargando recursos...",
        initializingDatabase: "Inicializando conexión a la base de datos...",
        loadingStatistics: "Cargando datos estadísticos...",
        preparingData: "Preparando datos de profesiones...",
        initializingCharts: "Inicializando gráficos...",
        loadingActivityFeed: "Cargando actividad...",
        finalizing: "Finalizando..."
    },
    fr: {
        // Nav
        title: "Indice de Perception AGI - Perception de l'IA par Différentes Professions",
        navTitle: "Indice de Perception AGI",
        // Sidebar navigation
        navHome: "Accueil",
        navStats: "Statistiques",
        navProfessions: "Professions",
        navComments: "Commentaires",
        navAnalysis: "Analyse",
        navActivity: "Activité",
        // Hero
        heroTitle: "Indice de Perception de l'Intelligence Artificielle",
        heroSubtitle: "Explorez comment différentes professions perçoivent l'IA",
        searchPlaceholder: "Rechercher des professions...",
        // Dashboard
        totalVotes: "Votes Totaux",
        avgPerception: "Indice de Perception Moyen",
        professionCount: "Professions Couvertes",
        // Sections
        popularProfessions: "Professions Populaires",
        addProfession: "Ajouter une Profession",
        loading: "Chargement...",
        dataAnalysis: "Analyse de Données",
        categoryDistribution: "Distribution des Catégories Professionnelles",
        perceptionDistribution: "Distribution de l'Indice de Perception",
        realtimeActivity: "Activité en Temps Réel",
        // Profession details modal
        agiAwarenessQuestion: "Comment cette profession perçoit-elle l'AGI ?",
        sliderInstruction: "Faites glisser le curseur pour sélectionner votre évaluation de la perception de l'AGI par cette profession",
        levelBasic: "Contact Initial (0-25%)",
        levelBasicDesc: "Peut seulement effectuer des tâches spécifiques sous guidance humaine",
        levelIntermediate: "Cognition Basique (26-50%)",
        levelIntermediateDesc: "Possède des capacités multi-domaines mais nécessite toujours une assistance humaine",
        levelAdvanced: "Application Pratique (51-75%)",
        levelAdvancedDesc: "Montre des capacités d'apprentissage autonome, approchant le niveau humain",
        levelExpert: "Compréhension Profonde (76-100%)",
        levelExpertDesc: "Possède une intelligence générale, peut résoudre des problèmes complexes de façon autonome",
        submitRating: "Soumettre l'Évaluation",
        currentRating: "Évaluation Actuelle",
        ratingParticipants: "Participants à l'Évaluation",
        // Add profession modal
        addNewProfession: "Ajouter une Nouvelle Profession",
        professionCategory: "Catégorie Professionnelle",
        selectCategory: "Veuillez sélectionner une catégorie",
        professionName: "Nom de la Profession",
        professionNamePlaceholder: "Entrez le nom de la profession",
        professionDescription: "Description de la Profession",
        professionDescriptionPlaceholder: "Décrivez les principales responsabilités et caractéristiques de cette profession (optionnel)",
        submit: "Soumettre",
        cancel: "Annuler",
        // Comments
        commentsBoard: "Tableau des commentaires",
        shareYourThoughts: "Partagez vos pensées...",
        sendComment: "Envoyer un commentaire",
        noComments: "Aucun commentaire. Soyez le premier à commenter.",
        // Messages
        ratingSuccess: "Évaluation soumise avec succès.",
        ratingError: "Erreur lors de l'envoi de l'évaluation. Veuillez réessayer.",
        submittingRating: "Envoi de votre évaluation...",
        commentSuccess: "Commentaire envoyé",
        commentSaved: "Votre commentaire a été sauvegardé",
        commentError: "Erreur",
        commentFailed: "Impossible de sauvegarder votre commentaire. Veuillez réessayer.",
        // New translations for features
        noData: "Aucune donnée disponible",
        loadFailed: "Chargement échoué, veuillez rafraîchir",
        loadMoreFailed: "Échec du chargement de plus de professions, veuillez rafraîchir la page",
        alreadyVoted: "Vous avez déjà voté pour cette profession",
        voteRegistered: "Votre vote a été enregistré",
        ratings: "évaluations",
        comments: "commentaires",
        more: "Plus...",
        // Add Profession Form Messages
        formError: "Veuillez remplir la catégorie et le nom de la profession",
        addSuccess: "Succès",
        professionAdded: "Profession ajoutée avec succès !",
        addError: "Échec de l'ajout de la profession, veuillez réessayer",
        // Loading text from landing page
        loadingResources: "Chargement des ressources...",
        initializingDatabase: "Initialisation de la connexion à la base de données...",
        loadingStatistics: "Chargement des données statistiques...",
        preparingData: "Préparation des données de professions...",
        initializingCharts: "Initialisation des graphiques...",
        loadingActivityFeed: "Chargement de l'activité...",
        finalizing: "Finalisation..."
    },
    de: {
        // Nav
        title: "AGI-Wahrnehmungsindex - Wahrnehmung von KI durch verschiedene Berufe",
        navTitle: "AGI-Wahrnehmungsindex",
        // Sidebar navigation
        navHome: "Startseite",
        navStats: "Statistik",
        navProfessions: "Berufe",
        navComments: "Kommentare",
        navAnalysis: "Analyse",
        navActivity: "Aktivität",
        // Hero
        heroTitle: "Künstliche Intelligenz Wahrnehmungsindex",
        heroSubtitle: "Entdecken Sie, wie verschiedene Berufe KI wahrnehmen",
        searchPlaceholder: "Berufe suchen...",
        // Dashboard
        totalVotes: "Gesamtstimmen",
        avgPerception: "Durchschnittlicher Wahrnehmungsindex",
        professionCount: "Abgedeckte Berufe",
        // Sections
        popularProfessions: "Beliebte Berufe",
        addProfession: "Beruf hinzufügen",
        loading: "Wird geladen...",
        dataAnalysis: "Datenanalyse",
        categoryDistribution: "Verteilung der Berufskategorien",
        perceptionDistribution: "Verteilung des Wahrnehmungsindex",
        realtimeActivity: "Echtzeit-Aktivität",
        // Profession details modal
        agiAwarenessQuestion: "Wie nimmt dieser Beruf AGI wahr?",
        sliderInstruction: "Ziehen Sie den Schieberegler, um Ihre Einschätzung der AGI-Wahrnehmung dieses Berufs auszuwählen",
        levelBasic: "Erster Kontakt (0-25%)",
        levelBasicDesc: "Kann nur unter menschlicher Anleitung spezifische Aufgaben ausführen",
        levelIntermediate: "Grundlegende Kognition (26-50%)",
        levelIntermediateDesc: "Verfügt über Multidomain-Fähigkeiten, benötigt aber immer noch menschliche Unterstützung",
        levelAdvanced: "Praktische Anwendung (51-75%)",
        levelAdvancedDesc: "Zeigt autonome Lernfähigkeiten, nähert sich dem menschlichen Niveau",
        levelExpert: "Tiefes Verständnis (76-100%)",
        levelExpertDesc: "Verfügt über allgemeine Intelligenz, kann komplexe Probleme autonom lösen",
        submitRating: "Bewertung abgeben",
        currentRating: "Aktuelle Bewertung",
        ratingParticipants: "Bewertungsteilnehmer",
        // Add profession modal
        addNewProfession: "Neuen Beruf hinzufügen",
        professionCategory: "Berufskategorie",
        selectCategory: "Bitte wählen Sie eine Kategorie",
        professionName: "Berufsbezeichnung",
        professionNamePlaceholder: "Berufsbezeichnung eingeben",
        professionDescription: "Berufsbeschreibung",
        professionDescriptionPlaceholder: "Beschreiben Sie die Hauptverantwortlichkeiten und Eigenschaften dieses Berufs (optional)",
        submit: "Absenden",
        cancel: "Abbrechen",
        // Comments
        commentsBoard: "Kommentarboard",
        shareYourThoughts: "Teilen Sie Ihre Gedanken...",
        sendComment: "Kommentar senden",
        noComments: "Keine Kommentare. Seien Sie der Erste, der kommentiert.",
        // Messages
        ratingSuccess: "Bewertung erfolgreich abgegeben.",
        ratingError: "Fehler beim Abgeben der Bewertung. Bitte versuchen Sie es erneut.",
        submittingRating: "Ihre Bewertung wird abgegeben...",
        commentSuccess: "Kommentar abgesendet",
        commentSaved: "Ihr Kommentar wurde gespeichert",
        commentError: "Fehler",
        commentFailed: "Es konnte kein Kommentar gespeichert werden. Bitte versuchen Sie es erneut.",
        // New translations for features
        noData: "Keine Daten verfügbar",
        loadFailed: "Laden fehlgeschlagen, bitte aktualisieren",
        loadMoreFailed: "Laden von mehr Berufen fehlgeschlagen, bitte aktualisieren Sie die Seite",
        alreadyVoted: "Sie haben bereits für diesen Beruf abgestimmt",
        voteRegistered: "Ihre Stimme wurde registriert",
        ratings: "Bewertungen",
        comments: "Kommentare",
        more: "Mehr...",
        // Add Profession Form Messages
        formError: "Bitte füllen Sie die Berufskategorie und den Namen aus",
        addSuccess: "Erfolg",
        professionAdded: "Beruf erfolgreich hinzugefügt!",
        addError: "Fehler beim Hinzufügen des Berufs, bitte versuchen Sie es erneut",
        // Loading text from landing page
        loadingResources: "Ressourcen werden geladen...",
        initializingDatabase: "Datenbankverbindung wird initialisiert...",
        loadingStatistics: "Statistikdaten werden geladen...",
        preparingData: "Berufsdaten werden vorbereitet...",
        initializingCharts: "Diagramme werden initialisiert...",
        loadingActivityFeed: "Aktivitäten werden geladen...",
        finalizing: "Fertigstellung..."
    },
    ja: {
        appTitle: "AI知覚指数",
        // Menu items
        overview: "概要",
        professions: "職業",
        about: "このプロジェクトについて",
        // Hero section
        heroTitle: "AI知覚指数",
        heroSubtitle: "あなたの職業とAIがどのように関わっているかを知りましょう",
        heroDescription: "様々な職業におけるAIの知覚能力を探索し評価するプラットフォームです",
        // Buttons
        explore: "職業を探索",
        addProfession: "職業を追加",
        // Dashboard
        totalVotes: "総投票数",
        avgPerception: "平均知覚指数",
        professionCount: "職業数",
        popularProfessions: "人気の職業",
        // User prompts and labels
        loading: "読み込み中...",
        search: "職業を検索...",
        seeAll: "すべて見る",
        back: "戻る",
        // Categories
        tech: "技術",
        education: "教育",
        healthcare: "医療",
        arts: "芸術",
        business: "ビジネス",
        service: "サービス",
        other: "その他",
        // Stats
        perceptionIndex: "知覚指数",
        perceptionDescription: "AI知覚指数は、特定の職業においてAIがどれだけ人間の能力に近づいているかを0-100のスケールで示します。",
        sliderInstructions: "自分の職業に対するAIの知覚指数を評価するためにスライダーを動かしてください。",
        levelBeginner: "初心者",
        levelBeginnerDesc: "AIは基本的なタスクを実行できますが、人間の指導が必要です。",
        levelIntermediate: "中級者",
        levelIntermediateDesc: "AIは複数の領域で能力を発揮しますが、人間の補助が必要です。",
        levelAdvanced: "上級者",
        levelAdvancedDesc: "AIは自習能力を示し、人間に近づいています。",
        levelExpert: "専門家",
        levelExpertDesc: "AIは汎用性があり、多くの問題を自律的に解決できます。",
        submit: "提出",
        // Card stats
        ratings: "件の評価",
        comments: "件のコメント",
        more: "もっと見る...",
        // Activity feed
        noActivity: "活動なし",
        // Profession details
        noDescription: "説明なし",
        commentsBoard: "コメントボード",
        noComments: "まだコメントはありません。最初のコメントをしましょう！",
        shareYourThoughts: "あなたの考えを共有してください...",
        sendComment: "コメントを送信",
        // Submit rating section
        submitRating: "評価を送信",
        currentRating: "現在の評価",
        ratingParticipants: "評価参加者数",
        // Messages
        ratingSuccess: "評価が正常に送信されました！",
        ratingError: "評価の送信エラー。もう一度お試しください。",
        submittingRating: "評価を送信中...",
        commentSuccess: "コメント送信完了",
        commentSaved: "コメントが保存されました",
        commentError: "エラー",
        commentFailed: "コメントを保存できませんでした。もう一度お試しください。",
        // New translations for features
        noData: "データがありません",
        loadFailed: "読み込みに失敗しました。更新してください",
        loadMoreFailed: "さらに職業を読み込めませんでした。更新してください",
        alreadyVoted: "この職業にはすでに投票しています",
        voteRegistered: "あなたの投票が登録されました",
        ratings: "件の評価",
        comments: "件のコメント",
        more: "もっと見る...",
        // Add Profession Form
        addNewProfession: "新しい職業を追加",
        professionCategory: "職業カテゴリ",
        selectCategory: "カテゴリを選択してください",
        professionName: "職業名",
        professionNamePlaceholder: "職業名を入力してください",
        professionDescription: "職業の説明",
        professionDescriptionPlaceholder: "この職業を簡単に説明してください（任意）",
        // Add Profession Form Messages
        formError: "職業カテゴリと名前を入力してください",
        addSuccess: "成功",
        professionAdded: "職業が正常に追加されました！",
        addError: "職業の追加に失敗しました。もう一度お試しください",
        // Loading text
        loadingResources: "リソースを読み込み中..."
    }
};

// Exports
export { translations as default, categories };

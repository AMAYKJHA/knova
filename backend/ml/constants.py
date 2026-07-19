"""Baked recommender constants.

Everything here was computed once from the ML training artifacts / CSVs and frozen
so the backend has NO runtime CSV dependency. The values must stay in lockstep with
the trained model set in backend/models/ — if the pipeline is retrained, regenerate:

* FEATURE_MEDIANS / ALS_MEAN  -> median()/mean() over knova_features_final.csv[FEATURES_ALL]
* TOPIC_TAGS                   -> knova_topic_tags.csv (topic -> normalized tag set)
* FEATURES_ALL / SCALE_FEATURES-> knova_feature_config.json

See the notebook serving cells (Knova_Engine.ipynb, cells 8-9) for the reference flow.
"""

# --- Ranker feature contract (order matters: model.predict expects this exact order) ---
FEATURES_ALL = [
    "dwell_norm_by_type",
    "read_velocity",
    "mastery_score",
    "kg_readiness",
    "depth_alignment",
    "base_skill_level",
    "curiosity_score",
    "topic_similarity",
    "tag_similarity",
    "als_score",
    "content_type_enc",
    "creator_trust",
    "user_topic_upvote_rate",
    "user_topic_interaction_count",
    "similarity_weighted_engagement",
]

# Subset scaled by the RobustScaler before predict (same order used at fit time).
SCALE_FEATURES = [
    "mastery_score",
    "kg_readiness",
    "depth_alignment",
    "topic_similarity",
    "tag_similarity",
    "als_score",
    "curiosity_score",
    "base_skill_level",
    "user_topic_upvote_rate",
    "user_topic_interaction_count",
    "similarity_weighted_engagement",
]

# Training-set medians (raw, pre-scaling) used to fill features we can't reconstruct
# for an unseen (user, post) pair. Mirrors df_features[FEATURES_ALL].median().
FEATURE_MEDIANS = {
    "dwell_norm_by_type": -0.293515,
    "read_velocity": -0.381948,
    "mastery_score": 0.5,
    "kg_readiness": -0.016,
    "depth_alignment": 0.767,
    "base_skill_level": 0.495,
    "curiosity_score": 0.785,
    "topic_similarity": 0.0,
    "tag_similarity": 0.083333,
    "als_score": 0.002521,
    "content_type_enc": 1.0,
    "creator_trust": 0.0,
    "user_topic_upvote_rate": 0.092499,
    "user_topic_interaction_count": 0.0,
    "similarity_weighted_engagement": 0.003568,
}

# Cold-start fill for als_score (mean, not median — matches the notebook's als_mean).
ALS_MEAN = 0.04676

# --- Retrieval / assembly hyperparameters (from notebook serving cell 9) ---
CANDIDATE_POOL_SIZE = 60          # unseen candidates retrieved per request
INTEREST_SHARE = 0.45             # pool share reserved for interest-topic content
TAG_ADJACENT_SHARE = 0.15         # pool share for tag-adjacent (Jaccard) topics
FOLLOWED_RESERVE = 5              # unseen followed-creator posts reserved into the pool
TAG_ADJ_MIN_SIMILARITY = 0.30     # Jaccard floor for a topic to count as tag-adjacent
TAG_ADJ_TOP_K = 3                 # tag-adjacent topics kept per interest topic

N_RANKED = 15                     # feed items produced per request
N_FOLLOWED_SLOTS = 2              # chronological followed-creator slots
N_EXPLORE_SLOTS = 3               # Thompson-sampled exploration slots
TOPIC_BOOST_WEIGHT = 0.325        # final_score = predicted*(1-w) + combined_similarity*w
TEMPERATURE = 0.35                # Boltzmann/softmax temperature for exploit sampling
MAX_TYPE_SHARE = 0.5              # a single content_type may fill at most this share
MAX_DISTINCT_TOPICS = 8           # cap on distinct topics in the final list

# Interest -> TF-IDF vector: each interest topic is repeated round(weight*3) times.
# Kept verbatim from training so user vectors land in the same space as tfidf_matrix.
INTEREST_WEIGHT_REPEAT = 3

# --- Topic -> normalized tag set, for tag_similarity (Jaccard) and tag-adjacency ---
_TOPIC_TAGS_RAW = {
    'DBMS': ['database', 'sql', 'backend', 'programming', 'software', 'computer_science', 'tech'],
    'Software Engineering': ['sdlc', 'agile', 'programming', 'software', 'computer_science', 'tech', 'career'],
    'Programming Fundamentals': ['python', 'javascript', 'oop_basics', 'programming', 'software', 'computer_science', 'tech', 'algorithms'],
    'Web Development': ['react', 'nextjs', 'frontend', 'backend', 'fullstack', 'programming', 'software', 'computer_science', 'tech'],
    'Mobile App Development': ['flutter', 'react_native', 'mobile', 'programming', 'software', 'computer_science', 'tech'],
    'Java Programming': ['java', 'oop', 'jvm', 'backend', 'programming', 'software', 'computer_science', 'tech', 'algorithms'],
    'C Programming': ['c_language', 'pointers', 'low_level', 'programming', 'software', 'computer_science', 'tech', 'algorithms', 'embedded'],
    'MERN Stack': ['mongodb', 'express', 'react', 'nodejs', 'fullstack', 'frontend', 'backend', 'programming', 'software', 'computer_science', 'tech', 'web_development'],
    'Machine Learning': ['ml', 'regression', 'model_training', 'ai_ml', 'data', 'algorithms', 'programming', 'software', 'computer_science', 'tech'],
    'Computer Vision': ['image_processing', 'cnn', 'deep_learning', 'ai_ml', 'data', 'algorithms', 'programming', 'software', 'computer_science', 'tech'],
    'Cybersecurity': ['security', 'phishing', 'encryption', 'network_security', 'programming', 'software', 'computer_science', 'tech'],
    'Cloud Computing': ['aws', 'docker', 'kubernetes', 'devops', 'backend', 'programming', 'software', 'computer_science', 'tech'],
    'Data Analysis': ['excel', 'sql', 'dashboards', 'data', 'statistics', 'algorithms', 'programming', 'software', 'computer_science', 'tech'],
    'AI': ['artificial_intelligence', 'automation', 'ai_ml', 'data', 'algorithms', 'programming', 'software', 'computer_science', 'tech'],
    'Discrete Mathematics': ['graph_theory', 'set_theory', 'math', 'algorithms', 'programming', 'computer_science', 'tech', 'ioe_subject'],
    'Cryptocurrency & Web3': ['bitcoin', 'blockchain', 'finance', 'tech', 'programming', 'software', 'computer_science'],
    'Computer Hardware': ['cpu', 'ram', 'pc_building', 'hardware', 'electronics', 'tech', 'computer_science'],
    'Electronics & Circuits': ['ohms_law', 'microcontrollers', 'arduino', 'hardware', 'electronics', 'tech', 'engineering'],
    'Embedded Systems': ['firmware', 'rtos', 'iot', 'hardware', 'electronics', 'tech', 'engineering', 'programming', 'c_programming'],
    'Robotics': ['actuators', 'path_planning', 'ros', 'drones', 'hardware', 'electronics', 'engineering', 'tech', 'ai_ml', 'programming'],
    'Mechanical Engineering': ['cad', 'machine_design', 'manufacturing', 'engineering', 'hardware', 'math', 'physics', 'ioe_subject'],
    'Structural Engineering': ['concrete', 'beam_deflection', 'shear_force', 'engineering', 'math', 'physics', 'construction'],
    'Civil Engineering & Construction': ['surveying', 'building_codes', 'engineering', 'construction', 'math', 'ioe_subject'],
    'Electrical Engineering': ['circuit_analysis', 'power_systems', 'engineering', 'electronics', 'hardware', 'math', 'ioe_subject'],
    'Classical Mechanics': ['newtons_laws', 'kinematics', 'torque', 'physics', 'math', 'engineering', 'science', 'ioe_subject', 'neet_subject'],
    'Fluid Mechanics': ['bernoulli', 'reynolds_number', 'viscosity', 'physics', 'engineering', 'math', 'science'],
    'Thermodynamics': ['entropy', 'heat_engines', 'physics', 'engineering', 'math', 'science', 'ioe_subject'],
    'Soil Mechanics': ['soil_compaction', 'bearing_capacity', 'engineering', 'construction', 'science'],
    'Automobiles & EVs': ['engine_maintenance', 'ev_battery', 'engineering', 'automotive', 'tech'],
    'Architecture': ['floor_planning', 'sustainable_design', 'design', 'engineering', 'construction', 'creative'],
    'Architectural History': ['brutalism', 'gothic', 'bauhaus', 'history', 'design', 'culture', 'creative', 'art'],
    'Graphic Design': ['typography', 'color_theory', 'figma', 'design', 'creative', 'art'],
    'UI/UX Design': ['wireframing', 'user_research', 'prototyping', 'design', 'creative', 'programming', 'tech', 'software', 'web_development'],
    'Interior Design': ['space_planning', 'lighting_design', 'design', 'creative', 'art'],
    'Linear Algebra': ['matrices', 'eigenvalues', 'math', 'algorithms', 'programming', 'science', 'ioe_subject'],
    'Calculus': ['derivatives', 'integration', 'gradient_descent', 'math', 'science', 'ai_ml', 'ioe_subject'],
    'Probability & Stats': ['bayes_theorem', 'normal_distribution', 'math', 'data', 'science', 'ai_ml'],
    'Classical Physics': ['electromagnetism', 'optics', 'nuclear_physics', 'physics', 'math', 'science', 'ioe_subject', 'neet_subject'],
    'Astronomy & Space': ['stellar_evolution', 'black_holes', 'space_missions', 'physics', 'science', 'space'],
    'Cell Biology': ['mitosis', 'organelles', 'atp_synthesis', 'biology', 'science', 'health', 'neet_subject', 'cee_subject'],
    'Genetics': ['dna_replication', 'mendelian_laws', 'crispr', 'biology', 'science', 'health', 'neet_subject', 'cee_subject'],
    'Human Anatomy': ['cardiovascular_system', 'endocrine_glands', 'biology', 'science', 'health', 'neet_subject', 'cee_subject'],
    'Organic Chemistry': ['hydrocarbons', 'functional_groups', 'chemistry', 'science', 'neet_subject', 'cee_subject', 'ioe_subject'],
    'Environmental Science': ['carbon_cycle', 'biodiversity', 'environment', 'science', 'sustainability', 'biology'],
    'Climate & Sustainability': ['renewable_energy', 'green_tech', 'environment', 'science', 'sustainability'],
    'Geomorphology': ['plate_tectonics', 'rock_cycle', 'earth_science', 'science', 'environment'],
    'Hydrology': ['rainfall_runoff', 'groundwater', 'earth_science', 'science', 'environment', 'civil_engineering'],
    'Agronomy': ['soil_nutrients', 'crop_rotation', 'agriculture', 'science', 'environment'],
    'Financial Accounting': ['balance_sheets', 'cash_flow', 'finance', 'business', 'career'],
    'Corporate Finance': ['portfolio_diversification', 'valuation', 'finance', 'business', 'career'],
    'Personal Finance': ['budgeting', 'credit_score', 'finance', 'lifestyle', 'career'],
    'Stock Market Investing': ['nepse', 'mutual_funds', 'dividend_stocks', 'nepal', 'finance', 'business', 'career'],
    'Macroeconomics': ['gdp', 'inflation', 'fiscal_policy', 'economics', 'finance', 'business'],
    'Microeconomics': ['monopoly_pricing', 'oligopoly', 'economics', 'finance', 'business'],
    'Strategic Management': ['swot_analysis', 'market_penetration', 'business', 'career', 'strategy'],
    'HR Management': ['talent_acquisition', 'labor_relations', 'business', 'career'],
    'Startups & Entrepreneurship': ['pitch_decks', 'mvp_building', 'fundraising', 'business', 'career', 'tech'],
    'Freelancing': ['client_contracts', 'pricing_work', 'career', 'business', 'lifestyle'],
    'E-commerce & Online Business': ['dropshipping', 'shopify', 'business', 'tech', 'career'],
    'Career Growth': ['salary_negotiation', 'networking', 'career', 'business', 'productivity'],
    'Real Estate & Property': ['renting_vs_buying', 'property_investment', 'finance', 'business', 'lifestyle'],
    'History of Nepal': ['lichchhavi', 'malla_dynasty', 'nepal', 'history', 'culture', 'society'],
    'Nepali Culture & Festivals': ['newari_traditions', 'festivals', 'nepal', 'culture', 'history', 'society', 'lifestyle'],
    'Nepali Literature': ['laxmi_prasad_devkota', 'muna_madan', 'nepal', 'literature', 'culture', 'history', 'society'],
    'Modern English Fiction': ['george_orwell', 'dystopian_fiction', 'literature', 'culture', 'society', 'english_language', 'ielts_subject'],
    'World Mythology': ['archetypes', 'monomyth', 'oral_traditions', 'mythology', 'culture', 'literature', 'society'],
    'Philosophy': ['dualism', 'empiricism', 'rationalism', 'philosophy', 'society', 'culture'],
    'Political Philosophy': ['social_contract', 'separation_of_powers', 'philosophy', 'politics', 'society', 'history'],
    'Current Affairs & Politics': ['election_coverage', 'geopolitics', 'politics', 'society', 'current_events'],
    'International Law': ['sovereignty', 'treaty_ratification', 'law', 'politics', 'society'],
    'Psychology & Human Behavior': ['cognitive_bias', 'habit_formation', 'psychology', 'health', 'society', 'science'],
    'Linguistics': ['syntax_trees', 'phonemes', 'language_learning', 'language', 'culture', 'society', 'science', 'english_language', 'ielts_subject', 'pte_subject'],
    'Archeology': ['stratigraphy', 'radiocarbon_dating', 'history', 'culture', 'science', 'society'],
    'Fitness & Strength Training': ['progressive_overload', 'home_workouts', 'fitness', 'health', 'lifestyle'],
    'Nutrition & Diet': ['macros', 'meal_prep', 'nutrition', 'health', 'lifestyle', 'biology'],
    'Mental Health': ['anxiety_management', 'therapy_basics', 'mental_health', 'health', 'psychology', 'lifestyle'],
    'Cooking & Recipes': ['nepali_cuisine', 'baking', 'nepal', 'food', 'lifestyle', 'culture'],
    'Skincare & Grooming': ['routine_building', 'skincare', 'lifestyle', 'health'],
    'Fashion & Style': ['wardrobe_basics', 'thrifting', 'fashion', 'lifestyle', 'style', 'creative'],
    'Parenting': ['screen_time', 'sleep_training', 'parenting', 'lifestyle', 'family', 'health'],
    'Relationships & Dating': ['communication_tips', 'breakup_recovery', 'relationships', 'lifestyle', 'psychology'],
    'Productivity': ['time_blocking', 'deep_work', 'study_techniques', 'productivity', 'lifestyle', 'career', 'exam_prep'],
    'Adventure Tourism': ['everest_base_camp', 'annapurna_circuit', 'nepal', 'travel', 'adventure', 'tourism'],
    'Cultural Tourism': ['lumbini', 'pashupatinath', 'nepal', 'travel', 'culture', 'tourism', 'history'],
    'Budget Travel': ['flight_deals', 'backpacking', 'travel', 'tourism', 'lifestyle'],
    'Sports Science': ['biomechanics', 'aerobic_threshold', 'sports', 'science', 'fitness', 'health'],
    'Football (Soccer)': ['tactics', 'transfer_news', 'sports', 'entertainment', 'football'],
    'Cricket Analytics': ['batting_technique', 'ipl_analysis', 'sports', 'entertainment', 'cricket', 'data'],
    'Gaming & Esports': ['speedrunning', 'esports_tournaments', 'gaming', 'entertainment', 'tech'],
    'Cinema Studies': ['cinematography', 'screenplay_structure', 'cinema', 'entertainment', 'media', 'art', 'creative'],
    'Music Theory & Production': ['harmonic_progression', 'beat_making', 'music', 'entertainment', 'art', 'creative'],
    'Photography': ['camera_settings', 'composition_rules', 'photography', 'art', 'creative', 'media'],
    'IOE Entrance Exam': ['engineering_entrance', 'exam_prep', 'nepal', 'ioe_subject', 'physics', 'chemistry', 'math', 'education'],
    'CEE Exam': ['medical_entrance', 'exam_prep', 'nepal', 'cee_subject', 'biology', 'physics', 'chemistry', 'education'],
    'NEET Exam': ['medical_entrance', 'exam_prep', 'neet_subject', 'biology', 'physics', 'chemistry', 'education'],
    'IELTS Preparation': ['english_proficiency', 'exam_prep', 'ielts_subject', 'english_language', 'study_abroad', 'education'],
    'PTE Preparation': ['english_proficiency', 'exam_prep', 'pte_subject', 'english_language', 'study_abroad', 'education'],
}

# Precomputed tag sets for O(1) Jaccard at request time.
TOPIC_TAG_SETS = {topic: set(tags) for topic, tags in _TOPIC_TAGS_RAW.items()}


def jaccard(a: set, b: set) -> float:
    union = len(a | b)
    return len(a & b) / union if union else 0.0


def tag_similarity(user_interest_topics, candidate_topic: str | None) -> float:
    """Max Jaccard overlap between the candidate topic's tag set and any of the
    user's interest-topic tag sets. Mirrors get_tag_similarity_for_candidate."""
    if not user_interest_topics or candidate_topic not in TOPIC_TAG_SETS:
        return 0.0
    cand = TOPIC_TAG_SETS[candidate_topic]
    return max(
        (jaccard(cand, TOPIC_TAG_SETS[t]) for t in user_interest_topics if t in TOPIC_TAG_SETS),
        default=0.0,
    )


def tag_adjacent_topics(user_interest_topics) -> set:
    """Topics that are tag-adjacent (Jaccard >= floor) to the user's interests but
    not themselves interests. Mirrors get_tag_adjacent_topics."""
    adjacent: set = set()
    if not user_interest_topics:
        return adjacent
    interest_set = set(user_interest_topics)
    for t in interest_set:
        if t not in TOPIC_TAG_SETS:
            continue
        base = TOPIC_TAG_SETS[t]
        scored = sorted(
            (
                (other, jaccard(base, tags))
                for other, tags in TOPIC_TAG_SETS.items()
                if other not in interest_set
            ),
            key=lambda x: x[1],
            reverse=True,
        )
        # top-K adjacent topics for this interest, above the similarity floor
        for other, score in scored[:TAG_ADJ_TOP_K]:
            if score >= TAG_ADJ_MIN_SIMILARITY:
                adjacent.add(other)
    return adjacent

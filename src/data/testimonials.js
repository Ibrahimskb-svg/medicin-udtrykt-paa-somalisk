// Godkendte beskeder til "Tak-væggen" på forsiden (se testimonial-wall.jsx).
//
// Der er IKKE noget backend/database her — nye beskeder sendes som en
// almindelig e-mail til Ibrahim (samme mailto-metode som kontaktformularen
// i site-index.jsx), og han læser dem i sin egen indbakke. Når han vil have
// en besked offentliggjort, tilføjes den her som et nyt objekt, og ændringen
// pushes til main — nøjagtig samme arbejdsgang som alt andet indhold på
// sitet. Listen starter bevidst tom; der må ALDRIG tilføjes opdigtede
// beskeder for at få den til at se "fyldt" ud.
//
// Hvert objekt:
//   name     — personens fornavn (eller det de selv skrev)
//   city     — personens by
//   lang     — sproget beskeden selv er skrevet på ("da" | "en" | "so" | "ar")
//   message  — selve beskeden, UÆNDRET fra det personen skrev (oversættes IKKE —
//              en ægte besked på afsenderens eget sprog er mere troværdig end
//              en oversættelse)
export const TESTIMONIALS = [];

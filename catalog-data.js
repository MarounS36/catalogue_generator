// catalog-data.js - Data configuration for your catalog

const catalogData = [
    {
        title: "Apperitif",
        subtitle: "Very Special Offers",
        products: [
            {
                name: "Martini Fiero",
                size: "1L",
                alcohol: "14.4°",
                ref: "00003934",
                promoPrice: "7.50 €",
                regularPrice: "12.00 €",
                label: "MARTINI",
                imagePath: "./images/martini-fiero.jpg" // Local image path
            },
            {
                name: "Martini Rosso",
                size: "1L",
                alcohol: "15.0°",
                ref: "00003935",
                promoPrice: "8.00 €",
                regularPrice: "13.00 €",
                label: "MARTINI",
                imagePath: "./images/martini-rosso.jpg"
            },
            {
                name: "Martini Bianco",
                size: "750ml",
                alcohol: "15.0°",
                ref: "00003936",
                promoPrice: "6.50 €",
                regularPrice: "10.00 €",
                label: "MARTINI",
                imageUrl: "https://example.com/martini-bianco.jpg" // Web URL example
            },
            {
                name: "Campari",
                size: "1L",
                alcohol: "25.0°",
                ref: "00003937",
                promoPrice: "15.50 €",
                regularPrice: "20.00 €",
                label: "CAMPARI",
                imagePath: "./images/campari.png"
            },
            {
                name: "Aperol",
                size: "1L",
                alcohol: "11.0°",
                ref: "00003938",
                promoPrice: "12.50 €",
                regularPrice: "16.00 €",
                label: "APEROL",
                imagePath: "./images/aperol.jpg"
            },
            {
                name: "Cynar",
                size: "700ml",
                alcohol: "16.5°",
                ref: "00003939",
                promoPrice: "14.00 €",
                regularPrice: "18.00 €",
                label: "CYNAR"
                // No image - will fallback to CSS bottle
            },
            {
                name: "Pimm's No.1",
                size: "1L",
                alcohol: "25.0°",
                ref: "00003940",
                promoPrice: "18.00 €",
                regularPrice: "23.00 €",
                label: "PIMM'S"
            },
            {
                name: "Ricard",
                size: "1L",
                alcohol: "45.0°",
                ref: "00003941",
                promoPrice: "22.00 €",
                regularPrice: "28.00 €",
                label: "RICARD"
            },
            {
                name: "Suze",
                size: "1L",
                alcohol: "15.0°",
                ref: "00003942",
                promoPrice: "16.50 €",
                regularPrice: "21.00 €",
                label: "SUZE"
            }
        ]
    },
    {
        title: "Whisky",
        subtitle: "Premium Selection",
        products: [
            {
                name: "Johnnie Walker Red",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004001",
                promoPrice: "25.00 €",
                regularPrice: "32.00 €",
                label: "JW RED",
                imagePath: "./images/whisky/johnnie-walker-red.jpg"
            },
            {
                name: "Johnnie Walker Black",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004002",
                promoPrice: "35.00 €",
                regularPrice: "45.00 €",
                label: "JW BLACK",
                imagePath: "./images/whisky/johnnie-walker-black.jpg"
            },
            {
                name: "Jameson",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004003",
                promoPrice: "28.00 €",
                regularPrice: "35.00 €",
                label: "JAMESON",
                imagePath: "./images/whisky/jameson.jpg"
            },
            {
                name: "Chivas Regal 12",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004004",
                promoPrice: "42.00 €",
                regularPrice: "55.00 €",
                label: "CHIVAS"
            },
            {
                name: "Glenfiddich 12",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00004005",
                promoPrice: "38.00 €",
                regularPrice: "48.00 €",
                label: "GLENFIDDICH"
            },
            {
                name: "Macallan 12",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00004006",
                promoPrice: "65.00 €",
                regularPrice: "80.00 €",
                label: "MACALLAN"
            },
            {
                name: "Jack Daniel's",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004007",
                promoPrice: "30.00 €",
                regularPrice: "38.00 €",
                label: "JACK D."
            },
            {
                name: "Crown Royal",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004008",
                promoPrice: "32.00 €",
                regularPrice: "40.00 €",
                label: "CROWN"
            },
            {
                name: "Tullamore Dew",
                size: "1L",
                alcohol: "40.0°",
                ref: "00004009",
                promoPrice: "26.00 €",
                regularPrice: "33.00 €",
                label: "TULLAMORE"
            }
        ]
    },
    {
        title: "Vodka",
        subtitle: "Crystal Clear",
        products: [
            {
                name: "Absolut Vodka",
                size: "1L",
                alcohol: "40.0°",
                ref: "00005001",
                promoPrice: "22.00 €",
                regularPrice: "28.00 €",
                label: "ABSOLUT"
            },
            {
                name: "Grey Goose",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00005002",
                promoPrice: "45.00 €",
                regularPrice: "55.00 €",
                label: "GREY GOOSE"
            },
            {
                name: "Beluga Noble",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00005003",
                promoPrice: "55.00 €",
                regularPrice: "70.00 €",
                label: "BELUGA"
            },
            {
                name: "Ketel One",
                size: "1L",
                alcohol: "40.0°",
                ref: "00005004",
                promoPrice: "35.00 €",
                regularPrice: "42.00 €",
                label: "KETEL ONE"
            },
            {
                name: "Tito's Handmade",
                size: "1L",
                alcohol: "40.0°",
                ref: "00005005",
                promoPrice: "28.00 €",
                regularPrice: "35.00 €",
                label: "TITO'S"
            },
            {
                name: "Chopin Potato",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00005006",
                promoPrice: "38.00 €",
                regularPrice: "48.00 €",
                label: "CHOPIN"
            },
            {
                name: "Stolichnaya",
                size: "1L",
                alcohol: "40.0°",
                ref: "00005007",
                promoPrice: "20.00 €",
                regularPrice: "26.00 €",
                label: "STOLI"
            },
            {
                name: "Ciroc",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00005008",
                promoPrice: "40.00 €",
                regularPrice: "50.00 €",
                label: "CIROC"
            },
            {
                name: "Belvedere",
                size: "700ml",
                alcohol: "40.0°",
                ref: "00005009",
                promoPrice: "42.00 €",
                regularPrice: "52.00 €",
                label: "BELVEDERE"
            }
        ]
    }
];

module.exports = catalogData;
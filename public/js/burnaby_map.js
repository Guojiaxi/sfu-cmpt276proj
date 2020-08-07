/**
 * Create google maps Map instance.
 * @param {number} lat
 * @param {number} lng
 * @return {Object}
 */
const createMap = ({ lat, lng }) => {
    return new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng },
        zoom: 15,
        mapTypeControlOptions: { mapTypeIds: [] },
        mapTypeId: 'roadmap',
        streetViewControl: false
    });
};

/**
 * Track the user location.
 * @param {Object} onSuccess
 * @param {Object} [onError]
 * @return {number}
 */
const trackLocation = ({ onSuccess, onError = () => {} }) => {
    if ('geolocation' in navigator === false) {
        return onError(new Error('Geolocation is not supported by your browser.'));
    }


    return navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
};

/**
 * Get position error message from the given error code.
 * @param {number} code
 * @return {String}
 */
const getPositionErrorMessage = code => {
    switch (code) {
        case 1:
            return 'Permission denied.';
        case 2:
            return 'Position unavailable.';
        case 3:
            return 'Timeout reached.';
    }
}

// array of markers for each location in locationArray
var locationMarkers = [];
// array of markers for each event happening today
var eventMarkers = [];

/**
 * Initialize the application.
 * Automatically called by the google maps API once it's loaded.
 */

var map;
function init() {
    //console.log(eventArray);

    const initialPosition = { lat: 49.278136, lng: -122.920469 };
    map = createMap(initialPosition);
    const contentString =
   '<div id="content">' +
   '<div id="siteNotice">' +
   "</div>" +
   '<h1 id="firstHeading" class="firstHeading">You are here!</h1>' +
   "</div>" +
   "</div>";
   const infowindow = new google.maps.InfoWindow({
    content: contentString
  });

    const marker = new google.maps.Marker({
        position: initialPosition,
        map: map,
        animation: google.maps.Animation.BOUNCE,
        title: "You!",
        label: " "
    });
    marker.addListener("click", () => {
      infowindow.open(map, marker);
    });

    var pinImage = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/blue-dot.png")
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));

    locationArray.forEach(function(location) {
        locationMarkers.push(new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            map: map,
            icon: pinImage,
            title: location.title,
            label: location.id
        }));
    });


    const $info = document.getElementById('info');

    let watchId = trackLocation({
        onSuccess: ({ coords: { latitude: lat, longitude: lng } }) => {
            marker.setPosition({ lat, lng });
            console.log("watching")
            console.log(lat)
            console.log(lng)
            map.panTo({ lat, lng });
            $info.textContent = `Lat: ${lat.toFixed(10)} Lng: ${lng.toFixed(10)}`;
            $info.classList.remove('error');
        },
        onError: err => {
            console.log($info);
            $info.textContent = `Error: ${err.message || getPositionErrorMessage(err.code)}`;
            $info.classList.add('error');
        }
    });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < locationMarkers.length; i++) {
    locationMarkers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

var locationArray = [ // array of locations courtesy of SFU
    {
        title: "Academic Quadrangle",
        lat: 49.278991,
        lng: -122.916498,
        description: "<h2>Academic Quadrangle</h2><p>This multipurpose academic building is located slightly to the east side of the campus. The main level of the AQ, the 3000 level, which is known as the Concourse level, consists of four main corridors and contains the major lecture halls. Smaller classrooms and offices are located on other levels of the AQ. One of SFU's most famous features is the AQ Gardens, which is a large outdoor area in the 4000 level of the AQ.</p>",
        photoname: "AQ.jpg",
        type: "building",
        icon: "default",
        id: "AQ"
    },
    {
        title: "Alcan Aquatic Research Centre",
        lat: 49.27577085,
        lng: -122.9175603,
        description: "<h2>Alcan Aquatic Research Building</h2><p>Biological Sciences is committed to support research in aquatic biology. On campus, Animal Care has extensive holding facilities for freshwater organisms, including large salmonids, and a small seawater reservoir. The Alcan Freshwater Aquatic Research Facility greatly increases the research capabilities of the aquatic biologists.</p>",
        photoname: "ALCAN.jpg",
        type: "building",
        icon: "default",
        id: "AAB"
    },
    {
        title: "Animal Care Centre",
        lat: 49.27557486,
        lng: -122.9166377,
        description: "<h2>Animal Care</h2><p>SFU conducts research, testing and teaching that involves animals in the most ethical and humane manner possible</p>",
        photoname: "animalcare.jpg",
        type: "building",
        icon: "default",
        id: "ACF"
    },
    {
        title: "Applied Sciences Building",
        lat: 49.27740875,
        lng: -122.9142129,
        description: "<h2>Applied Sciences</h2><p>The Applied Science Building is a small building with three floors - the 8000, 9000 and 10,000 levels. It contains the School of Engineering Science and School of Computing Science. Additionally, it has research programs in microelectronics, industrial automation, robotics, computer systems, and graphics biomedical computing.</p>",
        photoname: "ASB.jpg",
        type: "building",
        icon: "default",
        id: "ASB"
    },
    {
        title: "Bee Research Building",
        lat: 49.275823,
        lng: -122.915694,
        description: "<h2>Bee Research Building</h2><p>The Bee Research Building is a small 2 floor building that houses a biology laboratory.</p>",
        photoname: "bee.jpg",
        type: "building",
        icon: "default",
        id: "BEE"
    },
    {
        title: "Beedie Field Concession",
        lat: 49.278737,
        lng: -122.926181,
        description: "<h2>Beedie Field Concession</h2><p>Beedie Field is the northernmost collegiate softball playing field in North America and the only National Collegiate Athletic Association field outside the United States.</p>",
        photoname: "beedie.jpg",
        type: "building",
        icon: "default",
        id: "BFC"
    },
    {
        title: "Blusson Hall",
        lat: 49.27917958,
        lng: -122.9129148,
        description: "<h2>Blusson Hall</h2><p>The Faculty of Health Sciences is located in Blusson Hall.</p>",
        photoname: "BLU.png",
        type: "building",
        icon: "default",
        id: "BLU"
    },
    {
        title: "Convocation Mall",
        lat: 49.27929157,
        lng: -122.9188263,
        description: "<h2>Convocation Mall</h2><p>This is a large open courtyard centrally located on the campus. It is easily distinguished by the glass roof that covers the entire area. The Mall gets its name from the fact that convocation takes place under its roof twice a year. The parade of graduates begins at the AQ gardens, marches down the stairs, through the stage, around the Mall and then is seated in the east end, in front of the stage.</p><p><a href=http://www.sfu.ca/itservices/technical/webcams/webcams_convo.html>View Webcam</a></p>",
        photoname: "CONVO.jpg",
        type: "building",
        icon: "default",
        id: "CML"
    },
    {
        title: "Cornerstone",
        lat: 49.2779967,
        lng: -122.9120564,
        description: "<h2>Cornerstone</h2><p>The Cornerstone Building houses residential units, SFU Community Trust (UniverCity) offices, the Office of Francophone & Francophile Affairs (OFFA) and several restaurants and an organic delicatessen. Other services include a hair salon, wireless phone store, full-service print shop and a bank.</p>",
        photoname: "CORNER.jpg",
        type: "building",
        icon: "default",
        id: "CSTN"
    },
    {
        title: "Childcare Centre",
        lat: 49.28071589,
        lng: -122.9244161,
        description: "<h2>Daycare Centre</h2><p>SFU Childcare Society</p><p>Phone: 778.782.4569</p><p>Fax: 778.782.3058</p><p>For more information, visit <a href='http://www.sfuchildcare.ca/'>sfuchildcare.ca</p>",
        photoname: "CHILD.jpg",
        type: "building",
        icon: "default",
        id: "CC"
    },
    {
        title: "Diamond Alumni Centre",
        lat: 49.28105534,
        lng: -122.9165733,
        description: "<h2>Diamond Alumni Centre</h2><p>This two-floor multi-purpose restaurant and meeting centre features a panoramic view of Indian Arm and the North Shore mountains. Its unique combination of good food, personalized service and outstanding views make the DAC an especially popular venue for conferences, meetings, weddings and other celebratory gatherings from two to 200. The main dining room, bar and dance floor occupy the upper level, while the lower level features two reception and meeting rooms. Both levels offer access to an outside deck and all areas are wheelchair accessible. <br /><br />Phone: 778-782-4796.</p>",
        photoname: "DAC.jpg",
        type: "building",
        icon: "default",
        id: "DAC"
    },
    {
        title: "Dining Hall",
        lat: 49.279883,
        lng: -122.924668,
        description: "<h2>Dining Hall</h2><p>Open from September to April, the Residence Dining Hall provides meals for more than 700 residents who are on the meal plan.</p>",
        photoname: "DH.jpg",
        type: "building",
        icon: "default",
        id: "DH"
    },
    {
        title: "Discovery Park 1",
        lat: 49.27362189,
        lng: -122.9121208,
        description: "<h2>Discovery Park 1</h2><p>Since inception, Discovery Parks has been home to more than 130 companies and created almost two million square feet of technology space. Over $17 million in profits from our leasing and sales operations have already been distributed to post-secondary institutions, promoting further research and development. </p>",
        photoname: "discovery1.jpg",
        type: "building",
        icon: "default",
        id: "DIS1"
    },
    {
        title: "Discovery Park 2",
        lat: 49.27447589,
        lng: -122.912432,
        description: "<h2>Discovery Park 2</h2><p>Since inception, Discovery Parks has been home to more than 130 companies and created almost two million square feet of technology space. Over $17 million in profits from our leasing and sales operations have already been distributed to post-secondary institutions, promoting further research and development. </p>",
        photoname: "discovery2.jpg",
        type: "building",
        icon: "default",
        id: "DIS2"
    },
    {
        title: "Education Building",
        lat: 49.2798445,
        lng: -122.9155862,
        description: "<h2>Education Building</h2><p>A three-level building that stretches north of the Academic Quadrangle, and is located east of Robert C. Brown Hall. The Faculty of Education, including department related classrooms and facilities, occupies most of the building. The remainder of the area contains offices and labs that belong to the Archaeology department.</p>",
        photoname: "edb.jpg",
        type: "building",
        icon: "default",
        id: "EDB"
    },

    {
        title: "University Highlands Elementary School",
        lat: 49.278179,
        lng: -122.907872,
        description: "<h2>University Highlands Elementary School</h2><p>Serving students in grades Kindergarten through seven, University Highlands Elementary School is a LEED (Leadership in Energy and Environmental Design) Gold building, the first of its kind in British Columbia. Nestled on top of Burnaby Mountain, beside the Simon Fraser University campus, we are surrounded by natureÃÂ¢Ã¢ÂÂ¬Ã¢ÂÂ¢s beauty. Inside, our school reflects our commitment to the environment with reclaimed building materials, natural lighting and green products. Skylights, solar panels and a living roof use nature respectfully to help manage the buildingÃÂ¢Ã¢ÂÂ¬Ã¢ÂÂ¢s climate.</p>",
        photoname: "elementary.jpg",
        type: "building",
        icon: "default",
        id: "UHES"
    },

    {
        title: "Facilities Management",
        lat: 49.27581985,
        lng: -122.9132044,
        description: "<h2>Facilities Management</h2><p>Facilities Services, a service organization reporting to the Vice-President Finance and Administration, is dedicated to the support and success of Simon Fraser University's faculty, students, and staff. Responsibilities include maintenance, planning & development, operation and renovation of buildings, grounds and utility systems and engineering support. </p>",
        photoname: "fm.jpg",
        type: "building",
        icon: "default",
        id: "FM"
    },
    {
        title: "Greenhouses",
        lat: 49.276219,
        lng: -122.916037,
        description: "<h2>Greenhouses</h2><p>The Greenhouse Facilities consist of a research greenhouse, two teaching greenhouses, an outdoor compound and several controlled environment chambers.</p>",
        photoname: "gh.jpg",
        type: "building",
        icon: "default",
        id: "GH"
    },
    {
        title: "Halpern Centre",
        lat: 49.27962053,
        lng: -122.9176462,
        description: "<h2>Halpern Centre</h2><p>Halpern Centre is used for social, cultural and intellectual events such as lectures by distinguished visitors that are not part of the university's scheduled credit offerings. It is also the home of Conference Services.</p>",
        photoname: "halpern.jpg",
        type: "building",
        icon: "default",
        id: "HAL"
    },
    {
        title: "Hamilton Hall",
        lat: 49.280012,
        lng: -122.927731,
        description: "<h2>Hamilton Hall</h2><p>Built in 1993 and renovated in 2009, Hamilton Hall is for graduate students only and accommodates 103 students. The building has 4 studio suites adapted for wheelchair access including private washroom with grab rail bars.</p>",
        photoname: "HamiltonHall.jpg",
        type: "building",
        icon: "default",
        id: "HAM"
    },
    {
        title: "Images Theatre",
        lat: 49.28015246,
        lng: -122.917099,
        description: "<h2>Images Theatre</h2><p>Images Theatre, a 450-seat lecture hall located at the south end of Robert C. Brown Hall.</p>",
        photoname: "images.jpg",
        type: "building",
        icon: "default",
        id: "IMG"
    },
    {
        title: "Lorne Davies Complex",
        lat: 49.279292,
        lng: -122.921884,
        description: "<h2>Lorne Davies Complex<br>Gyms, Pool &amp; Fitness Centre</h2><p>Lorne Davies Complex, East, West and Central Gyms, Pool and Fitness Centre.</p>",
        photoname: "lorn.jpg",
        type: "building",
        icon: "default",
        id: "LDC"
    },
    {
        title: "Madge Hogarth House",
        lat: 49.28037643,
        lng: -122.9232359,
        description: "<h2>Madge Hogarth House</h2><p>SFU's oldest residence building. Now used for visiting groups and teams.</p>",
        photoname: "madge.jpg",
        type: "building",
        icon: "default",
        id: "MHH"
    },
    {
        title: "Maggie Benston Centre",
        lat: 49.2789666,
        lng: -122.9194057,
        description: "<h2>Maggie Benston Centre / Student Services</h2><p>This four-floor building is located centrally on campus, just south of the Convocation Mall. It houses all student services including the Registrar's Office, the Cashier's Office, the SFU Bookstore, the Career and Health Centre and the Centre for Students with Disabilities.</p>",
        photoname: "maggie.jpg",
        type: "building",
        icon: "default",
        id: "MBC"
    },
    {
        title: "McTaggart Cowan Hall",
        lat: 49.27920758,
        lng: -122.9254889,
        description: "<h2>McTaggart-Cowan Hall</h2><p>McTaggart-Cowan Hall is a co-ed traditional residence accommodating 200 students who currently are in at least their second year.</p>",
        photoname: "mccow.jpg",
        type: "building",
        icon: "default",
        id: "MCH"
    },
    {
        title: "Visitor Parking - West Mall Parkade",
        lat: 49.279998,
        ng: -122.923488,
        description: "<h2>Visitor Parking - West Mall Parkade</h2><p>Visitors please note: all parking at SFU is paid parking.</p>",
        photoname: "parking-westmall.jpg",
        type: "parking",
        icon: "parkicon.png",
        id: "VP"
    },
    {
        title: "Residence Office",
        lat: 49.28001667,
        lng: -122.9250667,
        description: "<h2>Residence Office</h2><p>Phone: 778-782-4201</p><p>Fax: 778-782-5903</p><p>Email: housing@sfu.ca</p><p>Located in building A below the dining hall.</p>",
        photoname: "placeholder.jpg",
        type: "building",
        icon: "default",
        id: "RO"
    },
    {
        title: "Robert. C. Brown Hall",
        lat: 49.28044642,
        lng: -122.9166269,
        description: "<h2>Robert C. Brown Hall</h2><p>This six-level building houses the psychology, geography and linguistics departments and the cognitive science program, as well as offices, classrooms and labs. </p>",
        photoname: "rcb.jpg",
        type: "building",
        icon: "default",
        id: "RCB"
    },
    {
        title: "Saywell Hall",
        lat: 49.27931257,
        lng: -122.9137945,
        description: "<h2>Saywell Hall</h2><p>Saywell Hall is located east of the Academic Quadrangle, and is the location of the School of Criminology</p>",
        photoname: "saywell.jpg",
        type: "building",
        icon: "default",
        id: "SWH"
    },
    {
        title: "Science Research Annex",
        lat: 49.275858,
        lng: -122.915313,
        description: "<h2>Science Research Annex</h2><p>The Science Research Annex (SRA) houses biological science research projects.</p>",
        photoname: "SRA.jpg",
        type: "building",
        icon: "default",
        id: "SRA"
    },
    {
        title: "Leslie & Gordon Diamond Family Auditorium",
        lat: 49.278728,
        lng: -122.918853,
        description: "<h2>Leslie & Gordon Diamond Family Auditorium</h2><p>The Leslie & Gordon Diamond Family Auditorium houses professional and student productions in dance, theatre, music and other performing arts.</p>",
        photoname: "theatre.jpg",
        type: "building",
        icon: "default",
        id: "DFA"
    },
    {
        title: "Shell House",
        lat: 49.27938256,
        lng: -122.9241371,
        description: "<h2>Shell House</h2><p>A co-ed traditional style residence accommodating 143 students who are in at least their second year.</p>",
        photoname: "shell.jpg",
        type: "building",
        icon: "default",
        id: "SHR"
    },
    {
        title: "Shrum Science Centre - Biology",
        lat: 49.277920,
        lng: -122.916906,
        description: "<h2>Shrum Science Centre - Biology</h2><p>Named after the university's first chancellor, the science centre is home to the departments of chemistry, biological sciences, physics, earth sciences, kinesiology, mathematics, and statistics and actuarial science. It encompasses the entire area south of the Academic Quadrangle. The departments are connected by a main corridor to the 3000 level of the AQ.</p>",
        photoname: "shrum.jpg",
        type: "building",
        icon: "default",
        id: "SCB"
    },
    {
        title: "Shrum Science Centre - Chemistry",
        lat: 49.278032,
        lng: -122.917689,
        description: "<h2>Shrum Science Centre - Chemistry</h2><p>Named after the university's first chancellor, the science centre is home to the departments of chemistry, biological sciences, physics, earth sciences, kinesiology, mathematics, and statistics and actuarial science. It encompasses the entire area south of the Academic Quadrangle. The departments are connected by a main corridor to the 3000 level of the AQ.</p>",
        photoname: "shrum.jpg",
        type: "building",
        icon: "default",
        id: "SCC"
    },
    {
        title: "Shrum Science Centre - Kinesiology",
        lat: 49.277752,
        lng: -122.915254,
        description: "<h2>Shrum Science Centre - Kinesiology</h2><p>Named after the university's first chancellor, the science centre is home to the departments of chemistry, biological sciences, physics, earth sciences, kinesiology, mathematics, and statistics and actuarial science. It encompasses the entire area south of the Academic Quadrangle. The departments are connected by a main corridor to the 3000 level of the AQ.</p>",
        photoname: "shrum.jpg",
        type: "building",
        icon: "default",
        id: "SCK"
    },
    {
        title: "Shrum Science Centre - Physics",
        lat: 49.277822,
        lng: -122.916048,
        description: "<h2>Shrum Science Centre - Physics</h2><p>Named after the university's first chancellor, the science centre is home to the departments of chemistry, biological sciences, physics, earth sciences, kinesiology, mathematics, and statistics and actuarial science. It encompasses the entire area south of the Academic Quadrangle. The departments are connected by a main corridor to the 3000 level of the AQ.</p>",
        photoname: "shrum.jpg",
        type: "building",
        icon: "default",
        id: "SCP"
    },
    {
        title: "South East Classroom Block",
        lat: 49.276996,
        lng: -122.912582,
        description: "<h2>South East Classroom Block</h2><p>This building contains classrooms used by Fraser International College.</p>",
        photoname: "seblock.jpg",
        type: "building",
        icon: "default",
        id: "SECB"
    },
    {
        title: "South Science Building",
        lat: 49.27723376,
        lng: -122.9180002,
        description: "<h2>South Science Building</h2><p>This building contains the Department of Molecular Biology and Biochemistry, laboratories, and professors' offices.</p>",
        photoname: "ssb.jpg",
        type: "building",
        icon: "default",
        id: "SSB"
    },
    {
        title: "Strand Hall",
        lat: 49.27891361,
        lng: -122.9148567,
        description: "<h2>Strand Hall</h2><p>This four-level administration building, just east of the Academic Quadrangle, houses the President and Vice-President offices, Human Resources, Research Services, Employment Equity, Academic Computing Services, Alumni, and University Communications.</p>",
        photoname: "strand.jpg",
        type: "building",
        icon: "default",
        id: "SH"
    },
    {
        title: "Student Central",
        lat: 49.279337,
        lng: -122.919644,
        description: "<h2>Student Central</h2><p>Student Central is a gathering space and a first stop for students and visitors alike to find out what's happening at SFU. </p>",
        photoname: "studentservices.jpg",
        type: "building",
        icon: "default",
        id: "SS"
    },
    {
        title: "TASC1",
        lat: 49.2766178,
        lng: -122.9144597,
        description: "<h2>TASC 1</h2><p>Technology and Science Complex 1 is home to Computing Science faculty and graduate laboratories, freeing up space for undergrads within the existing Applied Science Building.</p>",
        photoname: "TASC1.jpg",
        type: "building",
        icon: "default",
        id: "TASC1"
    },
    {
        title: "TASC2",
        lat: 49.27693278,
        lng: -122.9161978,
        description: "<h2>TASC 2</h2><p>Technology and Science Complex 2 research groups study a range of issues, from greenhouse gas reduction to the monitoring and analysis of global media. The building's unique features include vibration-free floating floors for ultra-high resolution microscopes and lasers, a huge clean room for creating advanced materials, an environmental toxicology lab and a fully equipped recording studio.</p>",
        photoname: "TASC2.jpg",
        type: "building",
        icon: "default",
        id: "TASC2"
    },
    {
        title: "Terry Fox Field",
        lat: 49.27860389,
        lng: -122.9222488,
        description: "<h2>Terry Fox Field</h2><p>Terry Fox Field is a multi-purpose sport field that serves as the home field of the Simon Fraser Clan for soccer and football matches.</p>",
        photoname: "terry.jpg",
        type: "building",
        icon: "default",
        id: "TFF"
    },
    {
        title: "The Towers",
        lat: 49.28022245,
        lng: -122.9267013,
        description: "<h2>The Towers</h2><p>A modern, co-ed, mostly first-year student community consisting of three eight-story buildings housing approximately 250 students each.</p>",
        photoname: "towers.jpg",
        type: "building",
        icon: "default",
        id: "TWRS"
    },
    {
        title: "Townhouse Complex",
        lat: 49.28001248,
        lng: -122.9286861,
        description: "<h2>Townhouse Complex</h2><p>This complex consists of nine buildings, each housing 11 townhouse units.</p>",
        photoname: "townhouses.jpg",
        type: "building",
        icon: "default",
        id: "THC"
    },
    {
        title: "Transit Exchange",
        lat: 49.27853565,
        lng: -122.9125607,
        description: "<h2>Transit Exchange</h2><p>The main SFU bus loop.</p>",
        photoname: "transit.jpg",
        type: "building",
        icon: "default",
        id: "TLB"
    },
    {
        title: "Transportation Centre",
        lat: 49.27924957,
        lng: -122.9203713,
        description: "<h2>Transportation Centre</h2><p>This building is a collection of scattered offices in a three-level area. It lies over the main road into the campus between the West Mall Complex in the west and Convocation Mall in the east. The ground floor has the Campus Security office and a bus loop sheltered by an underpass. The other three floors contain the Rotunda and several student and university organizations, including Traffic and Parking, CJSF Student Radio Station, SFPIRG, Out on Campus and the Women's Centre.</p><p><a href=http://www.sfu.ca/itservices/technical/webcams/webcams_library.html>View Webcam</a></p>",
        photoname: "TC.jpg",
        type: "building",
        icon: "default",
        id: "TC"
    },
    {
        title: "UniverCity",
        lat: 49.2786,
        lng: -122.9106456,
        description: "<h2>UniverCity</h2><p>SFU's residential community offering a broad range of housing choices, shops, services and amenities benefiting the campus and new residents.</p>",
        photoname: "univercity.jpg",
        type: "building",
        icon: "default",
        id: "UC"
    },

    {
        title: "UniverCity Childcare",
        lat: 49.278865,
        lng: -122.910469,
        description: "<h2>UniverCity Childcare</h2><p>The most sustainable childcare facility in the world, the UniverCity Childcare Centre opened its doors on April 2, 2012. The revolutionary facility, with space for 50 three- to five-year-olds, is expected to be the first building in Canada to meet the Living Building Challenge, which means it will have to generate as much energy as it uses, collect or recycle more water than it consumes, and be built and operated using non-toxic materials, sourced as locally as possible. The centre cost 15 to 20 per cent less than other childcare facilities being built in the region, without the green features.<p>For more information, please visit <a href='http://www.sfuchildcare.ca'>UniverCity Childcare</a>.",
        photoname: "uccc.jpg",
        type: "building",
        icon: "default",
        id: "UCCC"
    },
    {
        title: "W.A.C. Bennett Library",
        lat: 49.27964153,
        lng: -122.9187834,
        description: "<h2>W.A.C. Bennett Library</h2><p>The library is a seven-floor building centrally located on the campus, on the north side of Convocation Mall. The library houses almost two million different items, including books, journals, maps and tapes. Visitors are welcome to make use of the collection on the premises and books may be borrowed by non-SFU persons through arrangements with local municipal libraries. SFU students have borrowing privileges upon presentation of their updated student card.</p><p>For more information, visit <a href='http://www.lib.sfu.ca/'>lib.sfu.ca</a></p>",
        photoname: "LIB.jpg",
        type: "building",
        icon: "default",
        id: "LIB"
    },
    {
        title: "West Mall Centre",
        lat: 49.279782,
        lng: -122.922077,
        description: "<h2>West Mall Centre</h2><p>West Mall Centre (WMC) combines offices, classrooms and six lecture theatres ranging in size from 40 seat policy rooms to 250 seat lecture halls. A 78 seat policy room doubles as the University's Senate room.</p>",
        photoname: "wmc.jpg",
        type: "building",
        icon: "default",
        id: "WMC"
    }

];

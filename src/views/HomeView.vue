<script setup>
import _ from "lodash";
import moment from "moment";

const firstName = defineModel('firstName')
const lastName = defineModel('lastName')

const eventi = [
  {
    "_id": "66d1c207db7a33e96e6cd5a4",
    "dateTime": "2025-01-01T10:40:09",
    "servizio": "piega",
    "firstName": "Guerra",
    "lastName": "Michael",
    "email": "guerramichael@bezal.com",
    "phone": "+39 (866) 544-2917"
  },
  {
    "_id": "66d1c207069eaf3e56cc0aca",
    "dateTime": "2024-09-17T01:21:31",
    "servizio": "taglio e piega",
    "firstName": "Cecelia",
    "lastName": "Little",
    "email": "cecelialittle@bezal.com",
    "phone": "+39 (809) 564-2789"
  },
  {
    "_id": "66d1c20704368bc73d944aae",
    "dateTime": "2024-09-15T07:01:06",
    "servizio": "piega",
    "firstName": "Lydia",
    "lastName": "Foster",
    "email": "lydiafoster@bezal.com",
    "phone": "+39 (922) 519-2870"
  },
  {
    "_id": "66d1c207c2630678a694fd6c",
    "dateTime": "2024-12-18T03:16:09",
    "servizio": "taglio e piega",
    "firstName": "Kimberley",
    "lastName": "Vang",
    "email": "kimberleyvang@bezal.com",
    "phone": "+39 (920) 505-3839"
  },
  {
    "_id": "66d1c2076343c9cc2ccc3fd2",
    "dateTime": "2024-11-29T08:50:28",
    "servizio": "taglio",
    "firstName": "Casandra",
    "lastName": "Freeman",
    "email": "casandrafreeman@bezal.com",
    "phone": "+39 (848) 510-3589"
  },
  {
    "_id": "66d1c20712f62920eca03ad2",
    "dateTime": "2024-11-05T06:43:55",
    "servizio": "piega",
    "firstName": "Grace",
    "lastName": "Alford",
    "email": "gracealford@bezal.com",
    "phone": "+39 (910) 525-3978"
  },
  {
    "_id": "66d1c2071b2367aee90dfd2c",
    "dateTime": "2024-10-24T01:19:42",
    "servizio": "taglio",
    "firstName": "Fannie",
    "lastName": "Horne",
    "email": "fanniehorne@bezal.com",
    "phone": "+39 (920) 499-2034"
  },
  {
    "_id": "66d1c20785fbd85c9253b2a3",
    "dateTime": "2024-11-30T11:32:11",
    "servizio": "taglio",
    "firstName": "Consuelo",
    "lastName": "Guerra",
    "email": "consueloguerra@bezal.com",
    "phone": "+39 (985) 429-3823"
  },
  {
    "_id": "66d1c207848d39e2e4d480ac",
    "dateTime": "2025-01-08T05:40:54",
    "servizio": "taglio",
    "firstName": "Carly",
    "lastName": "Potter",
    "email": "carlypotter@bezal.com",
    "phone": "+39 (965) 411-3958"
  },
  {
    "_id": "66d1c207e306dfc8c1e688df",
    "dateTime": "2024-12-16T01:05:47",
    "servizio": "taglio",
    "firstName": "Silvia",
    "lastName": "Everett",
    "email": "silviaeverett@bezal.com",
    "phone": "+39 (974) 443-2921"
  },
  {
    "_id": "66d1c207ce2a05c74adcb9a0",
    "dateTime": "2025-01-13T06:25:26",
    "servizio": "piega",
    "firstName": "Reyna",
    "lastName": "Blake",
    "email": "reynablake@bezal.com",
    "phone": "+39 (824) 505-3506"
  },
  {
    "_id": "66d1c20751aca1def7ebecfe",
    "dateTime": "2024-10-06T05:36:02",
    "servizio": "taglio e piega",
    "firstName": "Nola",
    "lastName": "Oneill",
    "email": "nolaoneill@bezal.com",
    "phone": "+39 (820) 568-2601"
  },
  {
    "_id": "66d1c207ad9647c104dba416",
    "dateTime": "2025-01-23T12:29:08",
    "servizio": "taglio e piega",
    "firstName": "Miles",
    "lastName": "Goodwin",
    "email": "milesgoodwin@bezal.com",
    "phone": "+39 (946) 502-2007"
  },
  {
    "_id": "66d1c2075e482f4dc52780ef",
    "dateTime": "2024-10-09T05:16:19",
    "servizio": "taglio e piega",
    "firstName": "Angela",
    "lastName": "Burgess",
    "email": "angelaburgess@bezal.com",
    "phone": "+39 (876) 529-3864"
  },
  {
    "_id": "66d1c20702498fe9c4922798",
    "dateTime": "2025-01-07T12:00:38",
    "servizio": "taglio e piega",
    "firstName": "Malinda",
    "lastName": "Marks",
    "email": "malindamarks@bezal.com",
    "phone": "+39 (979) 590-2016"
  },
  {
    "_id": "66d1c207695a1e1e4469514d",
    "dateTime": "2024-12-30T03:17:58",
    "servizio": "piega",
    "firstName": "Whitfield",
    "lastName": "Williamson",
    "email": "whitfieldwilliamson@bezal.com",
    "phone": "+39 (889) 508-3235"
  },
  {
    "_id": "66d1c207c45f7fb21320751b",
    "dateTime": "2025-01-20T05:45:01",
    "servizio": "piega",
    "firstName": "Bettie",
    "lastName": "Pierce",
    "email": "bettiepierce@bezal.com",
    "phone": "+39 (871) 501-3231"
  },
  {
    "_id": "66d1c207cfe6d1af24e8d49a",
    "dateTime": "2024-10-14T10:48:55",
    "servizio": "taglio",
    "firstName": "Wendy",
    "lastName": "Foreman",
    "email": "wendyforeman@bezal.com",
    "phone": "+39 (847) 441-2989"
  },
  {
    "_id": "66d1c207dbf08812714e6098",
    "dateTime": "2024-09-15T10:47:44",
    "servizio": "taglio e piega",
    "firstName": "Carissa",
    "lastName": "Wheeler",
    "email": "carissawheeler@bezal.com",
    "phone": "+39 (847) 463-3410"
  },
  {
    "_id": "66d1c207b765aa8037d1911e",
    "dateTime": "2024-09-01T08:53:30",
    "servizio": "taglio e piega",
    "firstName": "Sykes",
    "lastName": "Cooley",
    "email": "sykescooley@bezal.com",
    "phone": "+39 (974) 519-2705"
  },
  {
    "_id": "66d1c20755d736df9e9b6926",
    "dateTime": "2024-09-16T08:17:50",
    "servizio": "taglio e piega",
    "firstName": "Amparo",
    "lastName": "Phelps",
    "email": "amparophelps@bezal.com",
    "phone": "+39 (881) 521-3761"
  },
  {
    "_id": "66d1c207c6b94a99c1ec3388",
    "dateTime": "2024-10-25T06:02:12",
    "servizio": "taglio e piega",
    "firstName": "Jeanine",
    "lastName": "Brewer",
    "email": "jeaninebrewer@bezal.com",
    "phone": "+39 (824) 536-2407"
  },
  {
    "_id": "66d1c207d62a415ad1af4627",
    "dateTime": "2024-09-28T03:40:46",
    "servizio": "piega",
    "firstName": "Robinson",
    "lastName": "Walton",
    "email": "robinsonwalton@bezal.com",
    "phone": "+39 (824) 556-3411"
  },
  {
    "_id": "66d1c207cc5ab65abce429ee",
    "dateTime": "2025-01-12T05:19:59",
    "servizio": "taglio e piega",
    "firstName": "Ruby",
    "lastName": "Huffman",
    "email": "rubyhuffman@bezal.com",
    "phone": "+39 (939) 505-2807"
  },
  {
    "_id": "66d1c207ce1a8b2d6be00114",
    "dateTime": "2024-12-25T04:57:18",
    "servizio": "piega",
    "firstName": "Kristen",
    "lastName": "Pugh",
    "email": "kristenpugh@bezal.com",
    "phone": "+39 (964) 429-3714"
  },
  {
    "_id": "66d1c2077a4697dccbe3df74",
    "dateTime": "2024-12-18T05:13:41",
    "servizio": "taglio e piega",
    "firstName": "Aurora",
    "lastName": "Sheppard",
    "email": "aurorasheppard@bezal.com",
    "phone": "+39 (941) 582-2459"
  },
  {
    "_id": "66d1c2074566300d9e6c4fb8",
    "dateTime": "2024-11-04T07:08:04",
    "servizio": "taglio",
    "firstName": "Norma",
    "lastName": "Padilla",
    "email": "normapadilla@bezal.com",
    "phone": "+39 (805) 502-2969"
  },
  {
    "_id": "66d1c2076b2cf183d0e837dd",
    "dateTime": "2024-09-08T08:11:28",
    "servizio": "piega",
    "firstName": "Caitlin",
    "lastName": "Jarvis",
    "email": "caitlinjarvis@bezal.com",
    "phone": "+39 (934) 435-2179"
  },
  {
    "_id": "66d1c2073aff721ed613b7e8",
    "dateTime": "2024-10-01T06:53:21",
    "servizio": "taglio",
    "firstName": "Mitchell",
    "lastName": "Whitley",
    "email": "mitchellwhitley@bezal.com",
    "phone": "+39 (928) 545-3573"
  },
  {
    "_id": "66d1c20744dd38e2183b4b58",
    "dateTime": "2025-01-11T09:20:15",
    "servizio": "taglio e piega",
    "firstName": "Edith",
    "lastName": "Ellison",
    "email": "edithellison@bezal.com",
    "phone": "+39 (992) 445-2352"
  }
]

const grouped = _.groupBy(eventi, ev => moment(ev.dateTime, "YYYY-MM-DDTHH:mm:ss").format("D MMM ddd"));

console.log(grouped);
</script>

<template>
  <div class="supermine">
    <div class="mine">
      <div class="mine2">
        <div class="mine3">
          <div class="grid">
            <div v-for="data in grouped" role="rowgroup" jsname="yKkGU" class="OVSqWe" data-datekey="27941">
              <div v-for="(evento, index) in data"  role="row" class="YOmXMd">
                <div role="gridcell" :class="{ 'V4sZ3c': index === 0, 'XuJrye': index > 0 }">
                  <h2 v-if="index === 0" class="bf2t7b">
                    <div class="H3yh2e ubOFEd" tabindex="0" role="link"
                         aria-label="giovedì, 5 settembre">{{moment(evento.dateTime, "YYYY-MM-DDTHH:mm:ss").format("D")}}
                    </div>
                    <div class="U2CF5e" aria-hidden="true">
                      <div class="yRbOzc">{{moment(evento.dateTime, "YYYY-MM-DDTHH:mm:ss").format("MMM ddd")}}</div>
                    </div>
                  </h2>
                  <span v-else>{{moment(evento.dateTime, "YYYY-MM-DDTHH:mm:ss").format("MMM ddd")}}</span>
                </div>
                <div role="presentation" data-eventchip="" data-opens-details="true"
                     :class="{'ryakYc OY8yJd LbTWpe': index === 0, 'ryakYc OY8yJd': index > 0}">
                  <div role="gridcell" class="FVj2te JxNhxc">Tutto il giorno</div>
                  <div role="gridcell" class="FVj2te uFexlc EmMre">
                    <div role="button" tabindex="0" class="URIUGf rFUW1c">{{evento.firstName}} {{evento.lastName}} - {{evento.servizio}}</div>
                  </div>
                  <div role="gridcell" class="FVj2te AfMD1c">
                    <div class="FwBPib">
                      <div class="poxnAc " style="border-color: rgb(11, 128, 67);">
                        <span class="XuJrye">Ale, Accettato</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
<!--              <div role="row" class="YOmXMd">-->
<!--                <div role="gridcell" class="XuJrye"></div>-->
<!--                <div role="presentation" class="ryakYc OY8yJd">-->
<!--                  <div role="gridcell" class="FVj2te JxNhxc">14:30 – 15:30</div>-->
<!--                  <div role="gridcell" class="FVj2te uFexlc EmMre">-->
<!--                    <div role="button" tabindex="0" class="URIUGf rFUW1c">{{evento.firstName}} {{evento.lastName}} - {{evento.servizio}}</div>-->
<!--                  </div>-->
<!--                  <div role="gridcell" class="FVj2te AfMD1c">-->
<!--                    <div class="FwBPib">-->
<!--                      <div class="poxnAc " style="border-color: rgb(121, 134, 203);">-->
<!--                        <span class="XuJrye">Calendario: Eleonora Bragantini, Accettato</span>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
            </div>
          </div>
          <!--        <div class="container">-->
          <!--          <div class="row">-->
          <!--            <div class="col-sm-4">-->
          <!--              <form>-->
          <!--                <div class="form-group row">-->
          <!--                  <label for="staticEmail" class="col-sm-4 col-form-label">Nome</label>-->
          <!--                  <div class="col-sm">-->
          <!--                    <input type="text" class="form-control"v-model="firstName" >-->
          <!--                  </div>-->
          <!--                </div>-->
          <!--                <div class="form-group row">-->
          <!--                  <label for="inputPassword" class="col-sm-4 col-form-label">Cognome</label>-->
          <!--                  <div class="col-sm">-->
          <!--                    <input type="text" class="form-control"v-model="lastName">-->
          <!--                  </div>-->
          <!--                </div>-->
          <!--              </form>-->
          <!--            </div>-->
          <!--            <div class="class-sm-8">-->

          <!--            </div>-->
          <!--          </div>-->
          <!--        </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.supermine {
  position: relative;
  width: 100%;
  height: calc(100% - 100px);
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  box-sizing: border-box;
}

.mine {
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 auto;
  flex: 1 1 auto;
  overflow: hidden;
  position: relative;
}

.mine2 {
  position: absolute;
  inset: 0;
  overflow-y: hidden;
  outline: none;
}

.mine3 {
  bottom: 0;
  left: 0;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.grid {

  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  container-type: inline-size;
  container-name: calCommonListviewEventsTable;
}

.OVSqWe {
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: rgb(218, 220, 224) 1px solid;
}

.YOmXMd {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}

.V4sZ3c {
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  vertical-align: top;
  text-align: left;
  width: 120px;
  padding-left: 14px;
}

[role=columnheader], [role=rowheader], [role=gridcell] {
  outline: none;
}

.bf2t7b {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  color: #70757a;
  font-weight: normal;
  height: 32px;
  margin: 0;
  overflow: visible;
}

.H3yh2e.ubOFEd {
  cursor: pointer;
}

.H3yh2e {
  font-variant: tabular-nums;
  -webkit-font-feature-settings: "tnum" 1;
  font-feature-settings: "tnum" 1;
}

.H3yh2e {
  text-indent: -1.8px;
}

.H3yh2e {
  font-size: 18px;
  letter-spacing: -1.8px;
  border-radius: 100%;
  color: rgb(60, 64, 67);
  display: inline-block;
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  height: 36px;
  line-height: 36px;
  text-align: center;
  width: 36px;
}

.U2CF5e {
  height: 18px;
  font-weight: 500;
  letter-spacing: .8px;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
}

.yRbOzc {
  font-size: 11px;
  text-transform: uppercase;
  margin-left: 6px;
}

.ryakYc.LbTWpe, .YOmXMd.DSThoc .ryakYc.LbTWpe {
  margin-left: 0;
}

.ryakYc {
  border-radius: 32px;
  color: rgb(60, 64, 67);
  fill: rgb(60, 64, 67);
  cursor: pointer;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 auto;
  flex: 1 1 auto;
  height: 32px;
  margin-left: 120px;
  margin-right: 10px;
  outline: none;
  overflow: hidden;
}

.JxNhxc {
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  width: 160px;
  -webkit-box-ordinal-group: 2;
  -webkit-order: 1;
  order: 1;
}

.FVj2te {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uFexlc {
  width: 100%;
  -webkit-box-ordinal-group: 3;
  -webkit-order: 2;
  order: 2;
}

.uFexlc > .URIUGf {
  outline: none;
  font-weight: 500;
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
}

.AfMD1c {
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  width: 38px;
  -webkit-box-ordinal-group: 1;
  -webkit-order: 0;
  order: 0;
}

.FwBPib {
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  width: 12px;
  margin: auto 16px auto 10px;
}

.poxnAc {
  border-radius: 12px;
  border: 6px solid;
  width: 0;
  height: 0;
}

.XuJrye {
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  position: absolute;
  -webkit-user-select: none;
  user-select: none;
  white-space: nowrap;
  width: 1px;
}

</style>

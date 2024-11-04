<script setup>
import { ref } from 'vue'
import Moment from "moment";
import * as _ from "lodash";
import {extendMoment} from 'moment-range';
const moment = extendMoment(Moment);

const currentMonth = ref(moment().format("YYYY-MM-DD"));

let daysOfCurrentMonth = calculateDayOfCurrentMonth(moment(currentMonth.value).format("YYYY-MM-DD"));
console.log(daysOfCurrentMonth.value);

const eventi = [
  {
    "_id": "66d85ff9b4e570d80861cd81",
    "from": "2024-09-06T04:48",
    "to": "2024-09-09T05:35",
    "servizio": "taglio",
    "firstName": "Hayden",
    "lastName": "Graham",
    "email": "haydengraham@exovent.com",
    "phone": "+39 (878) 535-2150"
  },
  {
    "_id": "66d85ff91911d539d7b67758",
    "from": "2024-10-21T06:48",
    "servizio": "piega",
    "firstName": "Gayle",
    "lastName": "Castillo",
    "email": "gaylecastillo@exovent.com",
    "phone": "+39 (930) 484-2729"
  },
  {
    "_id": "66d85ff9c4181eb50b344fac",
    "from": "2024-09-13T10:11",
    "to": "2024-09-16T07:21",
    "servizio": "piega",
    "firstName": "Francesca",
    "lastName": "Richardson",
    "email": "francescarichardson@exovent.com",
    "phone": "+39 (957) 414-2136"
  },
  {
    "_id": "66d85ff90897ab9897cd4dbf",
    "from": "2024-09-01T04:19",
    "servizio": "piega",
    "firstName": "Lynette",
    "lastName": "Mendez",
    "email": "lynettemendez@exovent.com",
    "phone": "+39 (974) 509-3828"
  },
  {
    "_id": "66d85ff9920934e8f1123023",
    "from": "2024-10-30T09:44",
    "servizio": "piega",
    "firstName": "Franks",
    "lastName": "Fernandez",
    "email": "franksfernandez@exovent.com",
    "phone": "+39 (819) 417-2149"
  },
  {
    "_id": "66d85ff96e5bb0677937d324",
    "from": "2024-09-04T05:34",
    "servizio": "taglio",
    "firstName": "Lang",
    "lastName": "Bass",
    "email": "langbass@exovent.com",
    "phone": "+39 (920) 561-2822"
  },
  {
    "_id": "66d85ff99db180f86f30e4ae",
    "from": "2024-10-28T09:49",
    "servizio": "piega",
    "firstName": "Cameron",
    "lastName": "Pugh",
    "email": "cameronpugh@exovent.com",
    "phone": "+39 (812) 508-3189"
  },
  {
    "_id": "66d85ff928306924b2399d5c",
    "from": "2024-10-17T10:43",
    "to": "2024-10-27T11:50",
    "servizio": "taglio",
    "firstName": "Dixie",
    "lastName": "Boyer",
    "email": "dixieboyer@exovent.com",
    "phone": "+39 (927) 476-2777"
  },
  {
    "_id": "66d85ff99169d2fa40dd9992",
    "from": "2024-11-19T03:01",
    "servizio": "taglio e piega",
    "firstName": "Blackwell",
    "lastName": "Carter",
    "email": "blackwellcarter@exovent.com",
    "phone": "+39 (964) 451-2925"
  },
  {
    "_id": "66d85ff9bc09af2d0cbe44b6",
    "from": "2024-11-26T04:36",
    "servizio": "piega",
    "firstName": "Douglas",
    "lastName": "Cortez",
    "email": "douglascortez@exovent.com",
    "phone": "+39 (868) 482-2441"
  },
  {
    "_id": "66d85ff91e70a5701bcc8911",
    "from": "2024-09-25T02:18",
    "to": "2024-09-25T12:18",
    "servizio": "taglio e piega",
    "firstName": "Bernadine",
    "lastName": "Nash",
    "email": "bernadinenash@exovent.com",
    "phone": "+39 (850) 485-2044"
  },
  {
    "_id": "66d85ff9eb3298860f97bffc",
    "from": "2024-11-20T02:15",
    "to": "2024-11-22T03:40",
    "servizio": "piega",
    "firstName": "Esther",
    "lastName": "Sims",
    "email": "esthersims@exovent.com",
    "phone": "+39 (896) 449-3574"
  },
  {
    "_id": "66d85ff950e7c1f3b2ef99a0",
    "from": "2024-09-04T13:07",
    "to": "2024-09-04T15:07",
    "servizio": "taglio e piega",
    "firstName": "Hood",
    "lastName": "Gentry",
    "email": "hoodgentry@exovent.com",
    "phone": "+39 (826) 447-3601"
  },
  {
    "_id": "66d85ff963445eb1eaf23bb2",
    "from": "2024-10-22T08:21",
    "servizio": "piega",
    "firstName": "Hollie",
    "lastName": "Harding",
    "email": "hollieharding@exovent.com",
    "phone": "+39 (887) 458-2758"
  },
  {
    "_id": "66d85ff9632c53e56c2a10f1",
    "from": "2024-11-13T06:56",
    "servizio": "taglio",
    "firstName": "Rhea",
    "lastName": "Moss",
    "email": "rheamoss@exovent.com",
    "phone": "+39 (844) 488-3878"
  },
  {
    "_id": "66d85ff9018e5b165c85b018",
    "from": "2024-09-01T11:16",
    "to": "2024-09-11T11:06",
    "servizio": "taglio",
    "firstName": "Smith",
    "lastName": "May",
    "email": "smithmay@exovent.com",
    "phone": "+39 (930) 459-2378"
  },
  {
    "_id": "66d85ff9bf8188be9121f958",
    "from": "2024-10-28T07:18",
    "servizio": "piega",
    "firstName": "Mindy",
    "lastName": "Coffey",
    "email": "mindycoffey@exovent.com",
    "phone": "+39 (996) 570-3136"
  },
  {
    "_id": "66d85ff9db59417f0e80b7c1",
    "from": "2024-10-31T06:24",
    "servizio": "taglio e piega",
    "firstName": "Wallace",
    "lastName": "Conrad",
    "email": "wallaceconrad@exovent.com",
    "phone": "+39 (910) 521-3056"
  },
  {
    "_id": "66d85ff9f1b0dcaa9153ebf0",
    "from": "2024-11-06T03:45",
    "servizio": "taglio e piega",
    "firstName": "Emilia",
    "lastName": "Moody",
    "email": "emiliamoody@exovent.com",
    "phone": "+39 (898) 504-3789"
  },
  {
    "_id": "66d85ff9e3ef2839afd30358",
    "from": "2024-11-17T02:51",
    "servizio": "taglio e piega",
    "firstName": "Vicky",
    "lastName": "Mills",
    "email": "vickymills@exovent.com",
    "phone": "+39 (980) 466-2066"
  },
  {
    "_id": "66d85ff93373718bb6f0add6",
    "from": "2024-09-11T05:07",
    "servizio": "taglio e piega",
    "firstName": "Janelle",
    "lastName": "Sanford",
    "email": "janellesanford@exovent.com",
    "phone": "+39 (971) 530-3414"
  },
  {
    "_id": "66d85ff9a2e747512570d5c4",
    "from": "2024-09-29T08:29",
    "to": "2024-10-02T05:44",
    "servizio": "piega",
    "firstName": "Roberts",
    "lastName": "Trujillo",
    "email": "robertstrujillo@exovent.com",
    "phone": "+39 (912) 595-3616"
  },
  {
    "_id": "66d85ff95e03edb3e7974cdf",
    "from": "2024-11-12T05:33",
    "servizio": "taglio e piega",
    "firstName": "Melba",
    "lastName": "Todd",
    "email": "melbatodd@exovent.com",
    "phone": "+39 (888) 535-3083"
  },
  {
    "_id": "66d85ff93980c9f4e48213b9",
    "from": "2024-10-31T02:09",
    "servizio": "taglio e piega",
    "firstName": "Webster",
    "lastName": "Joyner",
    "email": "websterjoyner@exovent.com",
    "phone": "+39 (942) 530-3054"
  },
  {
    "_id": "66d85ff9ac537ec473b816f5",
    "from": "2024-11-16T05:15",
    "to": "2024-11-18T11:50",
    "servizio": "taglio e piega",
    "firstName": "Etta",
    "lastName": "Bond",
    "email": "ettabond@exovent.com",
    "phone": "+39 (926) 488-3371"
  },
  {
    "_id": "66d85ff91a2ade97508715ed",
    "from": "2024-11-28T08:40",
    "servizio": "taglio",
    "firstName": "Janice",
    "lastName": "Cotton",
    "email": "janicecotton@exovent.com",
    "phone": "+39 (855) 447-2601"
  },
  {
    "_id": "66d85ff99157098c7204da12",
    "from": "2024-09-06T12:25",
    "to": "2024-09-07T05:26",
    "servizio": "taglio",
    "firstName": "Howard",
    "lastName": "Lee",
    "email": "howardlee@exovent.com",
    "phone": "+39 (873) 499-3547"
  },
  {
    "_id": "66d85ff90657b90cb27a0d71",
    "from": "2024-11-16T01:12",
    "to": "2024-11-26T09:53",
    "servizio": "taglio",
    "firstName": "Gilda",
    "lastName": "Hewitt",
    "email": "gildahewitt@exovent.com",
    "phone": "+39 (915) 405-2609"
  },
  {
    "_id": "66d85ff9016a7827263a5e29",
    "from": "2024-09-15T02:27",
    "servizio": "piega",
    "firstName": "Nina",
    "lastName": "Lester",
    "email": "ninalester@exovent.com",
    "phone": "+39 (915) 514-2359"
  },
  {
    "_id": "66d85ff9c73c60baba93f8ad",
    "from": "2024-10-15T10:32",
    "servizio": "taglio e piega",
    "firstName": "Skinner",
    "lastName": "Bartlett",
    "email": "skinnerbartlett@exovent.com",
    "phone": "+39 (896) 498-3769"
  }
]

const grouped = {};
const ordered = _.orderBy(eventi, [(d) => moment(d.from).format("YYYY-MM-DD"), (d) => d.to ? d.to : '1000-01-01'], ['asc', 'desc']);
ordered.forEach(ev => {
  const key = moment(ev.from).format("YYYY-MM-DD");
  const alreadyPushed = grouped[key] && grouped[key].length || 0
  if (alreadyPushed) {
    for (let i = 0; i <= alreadyPushed; i++) {
      const founded = _.find(grouped[key], e => e.position === i);
      if (!founded) {
        ev.position = i;
        break;
      }
    }
  } else {
    ev.position = alreadyPushed;
  }
  if (!ev.to) {
    ev.allDay = true;
    checkAndPush(key, ev);
  } else {
    const range = moment.range(moment(ev.from).format("YYYY-MM-DD"), moment(ev.to).format("YYYY-MM-DD"));
    const days = Array.from(range.by('days')).map(m => m.format('YYYY-MM-DD'))
    if (days.length > 1) {
      ev.moreDay = true;
    }
    days.forEach((d, i) => {
      ev.firstDay = i === 0;
      ev.remainingDay = days.length - i;
      checkAndPush(d, JSON.parse(JSON.stringify(ev)));
    })
  }
})

function changeMonth(month) {
  currentMonth.value = moment(currentMonth.value).add(month, "months").format("YYYY-MM-DD");
  daysOfCurrentMonth = calculateDayOfCurrentMonth(moment(currentMonth.value).format("YYYY-MM-DD"));
}

function checkAndPush(key, obj) {
  if (!grouped[key]) {
    grouped[key] = [obj];
  } else {
    grouped[key].push(obj);
  }
}

function calculateDayOfCurrentMonth(current) {
  const weekOfStartOfMonth = moment(current).startOf("month").startOf("isoWeek");
  const weekOfEndOfMonth = moment(current).endOf("month").endOf("isoWeek");
  const range = moment.range(moment(weekOfStartOfMonth), moment(weekOfEndOfMonth));
  const days = Array.from(range.by('days')).map(m => m.format('YYYY-MM-DD'));
  return _.chunk(days, 7);
}
</script>

<template>
  <div class="row">
    <div class="mt-2 col-12 text-center">
      <h2>
        <a href="javascript:void(0)" @click="() => changeMonth(-1)"><i class="fas fa-angle-left mr-4"></i></a>
        {{moment(currentMonth).format("MMMM YYYY")}}
        <a href="javascript:void(0)" @click="() => changeMonth(1)"><i class="fas fa-angle-right ml-4"></i></a>
      </h2>
    </div>
  </div>
  <div class="supermine">
    <div class="mine">
      <div role="main" tabindex="-1" aria-describedby="c4117" class="mXmivb ogB5bf u4s1Oc" jscontroller="iyh5o"
           jsaction="TkEEhc:u9xqIe;jxCHud:XsjTP;kTPjtc:kCtXif;heR6Cf:KmWemb;F2qKcc:pN2nfb;lfYYIb:KbbOyc;m463Ae:tYm26b;qxIqze:oE3VY;RJcxM:oUWlHf;qako4e:v5hNId;rcuQ6b:npT2md;b2Acw:SriQ7d;L4RPxb:PEFSMe;yu3jad:AOJ9lf;BfU09d:CMZY2e;n2FbAf:CAGJf;cOS9vb:xHEQGc;qkWydd:ymAKke;urdzG:D5o1fd;KIysF:D5o1fd;hLpH9b:Tp2SZe;WhiWJd:KbbOyc;Tl8Pff:vFga8c;JvsDzf:rbRoAf;MNWSEd:KbbOyc;WpNvse:nKhbyd;OwgJtf:KbbOyc;NfKLZe:KbbOyc;DqBFzc:npT2md;lkiSbd:npT2md"
           jslog="34348;15:[0,6];track: impression,DqBFzc,lkiSbd; mutable:rci;" data-mouse-wheel="true"
           data-period-type="month" style="opacity: 1;">
        <h1 jsaction="focus:h06R8; blur:zjh6rb" jsname="rb2thd"
            class="XuJrye" id="c4117"
            aria-label=" ottobre 2024, 13 eventi" jscontroller="cwf58c">
          ottobre 2024, 13 eventi</h1>
        <div class="K2fuAf" jsname="KL7Kx" data-view-heading=" ottobre 2024, 13 eventi"
             style="z-index: auto; opacity: 1; transform: none; will-change: auto;">
          <div role="grid" aria-readonly="true" jsname="KZOukd"
               jsaction="rk1UBd:rQPSTd;rcuQ6b:npT2md; 'focusin':npT2md; click:cOuCgd;A4uS1b:.CLIENT;znnfEd:.CLIENT;YOrDqe:.CLIENT;vL1IB:.CLIENT;sSfkvb:.CLIENT;zHe0gf:.CLIENT;y6LN7c:.CLIENT;pPc6Qe:.CLIENT;kQj7Pe:.CLIENT;przuUe:.CLIENT"
               data-is-column-view-context="false" data-chip-offset-top="32" class="RAaXne nfCJAf" jscontroller="hLA6xc"
               data-start-date-key="27966" data-end-date-key="28003" data-chip-rows="2">
            <div role="row" class="wuX2hf">
              <div role="presentation" class="l4SGD"></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Lunedì</span><span
                  aria-hidden="true" class="EeuFAf">Lun</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Martedì</span><span
                  aria-hidden="true" class="EeuFAf">Mar</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Mercoledì</span><span
                  aria-hidden="true" class="EeuFAf">Mer</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Giovedì</span><span
                  aria-hidden="true" class="EeuFAf">Gio</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Venerdì</span><span
                  aria-hidden="true" class="EeuFAf">Ven</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Sabato</span><span
                  aria-hidden="true" class="EeuFAf">Sab</span></div>
              <div role="columnheader" data-dragsource-type="8" tabindex="0" class="w6FdBf ChfiMc"><span class="XuJrye">Domenica</span><span
                  aria-hidden="true" class="EeuFAf">Dom</span></div>
            </div>
            <div role="presentation" class="kbf0gd">
              <!-- one row for week -->
              <div v-for="week in daysOfCurrentMonth" role="row" class="FLFkR">
                <!-- row for click to add event -->
                <div aria-hidden="true" jsname="GkYald" class="sLvTye">
                  <!-- one element for day -->
                  <div v-for="day in week" class="MGaLHf ChfiMc" jsname="LF4U9b" data-dragsource-type="8"
                       data-datekey="27966"></div>
                </div>
                <!-- row for show date -->
                <div aria-hidden="true" class="umyEjb">
                  <!-- one element for day -->
                  <div
                      v-for="day in week"
                      class="RCXPcd"
                      :class="{'o5s4T': moment(currentMonth).format('MM') === moment(day).format('MM')}"
                  >
                    <h2 aria-hidden="true" jsname="KpB2Ud" jslog="184671"
                        data-dragsource-ignore="true" data-datekey="27966" jsaction="click:Tp2SZe"
                        class="w48V4c ubOFEd">{{ moment(day).format("DD") }}
                    </h2>
                  </div>
                </div>
                <!-- row for show events -->
                <div class="T3BIT">
                  <!-- one element for day -->
                  <div role="presentation" data-dragsource-type="8" class="PTdDEc ChfiMc" jscontroller="YVjRCf"
                       style="height: 3em;">
                    <!-- with events -->
                    <div v-for="(day, index) in week" role="gridcell" class="qLWd9c" aria-labelledby="c4118" tabindex="0">
                      <h2 class="CqwSk XuJrye" id="c4118">
                        {{ grouped[day] && grouped[day].length > 0 ? grouped[day].length : 'Nessun' }}
                        event{{ grouped[day] && grouped[day].length > 1 ? 'i' : 'o' }}, {{ moment(day).format('dddd, DD MMM') }}
                      </h2>
                      <div v-if="grouped[day] && grouped[day].length" role="presentation">
                        <div v-for="(event, indexEv) in grouped[day]" class="vEJ0bc ChfiMc rFUW1c Po94xd" :class="{'GHWQBd': !event.moreDay}"
                             style="border-color: rgb(121, 134, 203);"
                             :style="{top: event.position + 'em', left: (100/7 * index) + '%', width: (event.remainingDay && (event.firstDay || index === 0)) ? (100/7 * Math.min(event.remainingDay, (7 - index))) + '%' : '14.29%'}"
                        >
                          <div role="button" data-stacked-layout-chip="true"
                               class="KF4T6b jKgTF QGRmIf"
                               :class="{'smECzc': (!event.allDay && !event.moreDay && event.to) , 'PU9jSd': (event.moreDay && !event.firstDay && index !== 0)}"
                               :style="{backgroundColor: (event.allDay || event.moreDay) ? 'rgb(11, 128, 67)' : 'transparent'}"
                               tabindex="0" style="">
                            <div v-if="!event.allDay && !event.moreDay" class="ZWOtn"><div class="VlNR9e" style="border-color: rgb(121, 134, 203);"></div></div>
                            <span aria-hidden="true" class="nHqeVd">
                              <span v-if="!event.allDay" class="DvyQhe BdCDHc">{{ moment(event.from).format('HH:mm') }}</span>
                              <span class="WBi6vc">{{event.firstName + ' ' + event.lastName + ' ' + event.servizio}}</span>
                            </span>
                            <span class="XuJrye">15:30 a 16:30, Buoni pasto 463€, Calendario: Eleonora Bragantini, Nessuna posizione, 30 settembre 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

[role=columnheader], [role=rowheader], [role=gridcell] {
  outline: none;
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

.ogB5bf {
  overflow: hidden;
}

.mXmivb {
  position: absolute;
  inset: 0;
  overflow-y: hidden;
  outline: none;
}

.K2fuAf {
  position: absolute;
  inset: 0;
}

.RAaXne:not(.Wyo4Qe) {
  border-left-color: rgb(218, 220, 224);
}

.RAaXne:not(.Wyo4Qe) {
  border-left: rgb(241, 243, 244) 1px solid;
}

.nfCJAf {
  margin-left: 8px;
  margin-right: 8px;
}

.RAaXne {
  background-color: #fff;
  height: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.wuX2hf {
  margin: 0;
  -webkit-box-align: stretch;
  -webkit-align-items: stretch;
  align-items: stretch;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  height: 20px;
}

.w6FdBf {
  border-right-color: rgb(218, 220, 224);
}

.w6FdBf {
  border-right: rgb(241, 243, 244) 1px solid;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  text-align: center;
  text-transform: uppercase;
}

.EeuFAf {
  color: #70757a;
  font-size: 11px;
  font-weight: 500;
  line-height: 20px;
}

.kbf0gd {
  margin: 0;
  overflow: hidden;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.FLFkR {
  border-bottom-color: rgb(218, 220, 224);
}

.FLFkR {
  position: relative;
  overflow: hidden;
  border-bottom: rgb(241, 243, 244) 1px solid;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
}

.umyEjb {
  pointer-events: none;
  z-index: 3;
}

.umyEjb, .sLvTye {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}

.MGaLHf {
  border-right: rgb(241, 243, 244) 1px solid;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
}

.RCXPcd {
  font-size: 14px;
  /*line-height: 30px;*/
  color: #70757a;
  text-align: center;
  background: transparent;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
}

.o5s4T .w48V4c {
  color: rgb(60, 64, 67);
}

.w48V4c {
  /*margin: 0;*/
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .3px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  width: -webkit-max-content;
  width: max-content;
  min-width: 24px;
  color: #70757a;
  line-height: 16px;
  pointer-events: auto;
}

.T3BIT {
  /*margin-top: 20px;*/
  margin-top: 30px;
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
}

body .vEJ0bc, body .PTdDEc {
  font-size: 20px;
  height: 20px;
}

.PTdDEc {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  position: relative;
  overflow: hidden;
  font-size: 24px;
}

.qLWd9c {
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  border-right: 1px solid transparent;
}

[role=columnheader], [role=rowheader], [role=gridcell] {
  outline: none;
}

.CqwSk {
  margin: 0;
}

body .vEJ0bc, body .PTdDEc {
  font-size: 20px;
  height: 20px;
}

.PTdDEc {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  position: relative;
  overflow: hidden;
  font-size: 24px;
}

body .vEJ0bc, body .PTdDEc {
  font-size: 20px;
  height: 20px;
}

.T3BIT .vEJ0bc {
  padding-right: 8px;
}

.Po94xd {
  padding-right: 8px;
}

.vEJ0bc {
  position: absolute;
  height: 24px;
  padding-right: 12px;
  box-sizing: border-box;
  pointer-events: none;
  -webkit-transition: opacity .3s cubic-bezier(.4, 0, .2, 1), -webkit-transform .3s cubic-bezier(.4, 0, .2, 1);
  transition: opacity .3s cubic-bezier(.4, 0, .2, 1), -webkit-transform .3s cubic-bezier(.4, 0, .2, 1);
  transition: transform .3s cubic-bezier(.4, 0, .2, 1), opacity .3s cubic-bezier(.4, 0, .2, 1);
  transition: transform .3s cubic-bezier(.4, 0, .2, 1), opacity .3s cubic-bezier(.4, 0, .2, 1), -webkit-transform .3s cubic-bezier(.4, 0, .2, 1);
  -webkit-font-smoothing: antialiased;
  list-style: none;
  z-index: 5;
}

body .KF4T6b {
  padding: 0 4px;
  height: 18px;
  line-height: 16px;
}

.KF4T6b.jKgTF {
  cursor: pointer;
}

.KF4T6b.smECzc {
  background-color: transparent;
  padding-right: 0;
}

.KF4T6b.smECzc {
  color: rgb(60, 64, 67);
  fill: rgb(60, 64, 67);
  font-weight: 500;
}

.KF4T6b {
  border: 1px solid transparent;
}

.KF4T6b {
  height: 22px;
  padding: 0 8px;
  line-height: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  box-sizing: border-box;
  pointer-events: auto;
  overflow: hidden;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  outline: none;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  border: 1px solid transparent;
  -webkit-transition: background-color .1s linear;
  transition: background-color .1s linear;
}

.ZWOtn {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  margin-right: 6px;
}

.VlNR9e {
  border-radius: 8px;
  border: 4px solid;
  height: 0;
  width: 0;
}

.nHqeVd {
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  overflow: hidden;
}

.KF4T6b.PU9jSd, .pmUZFe.PU9jSd {
  pointer-events: none;
  opacity: .01;
}

.DvyQhe.BdCDHc {
  margin-right: 4px;
}

.DvyQhe {
  font-weight: 400;
}

.DvyQhe, .wZEs1c {
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
}

.WBi6vc {
  overflow: hidden;
  -webkit-box-flex: 0;
  -webkit-flex: 0 1 auto;
  flex: 0 1 auto;
  white-space: nowrap;
}

</style>

const fs = require('fs');

	function parse_sensor(str) {
		const keys = {
			'-1,2,-94,-100,': 'key_ver',
			'-1,2,-94,-101,': 'user_agent',
			'-1,2,-94,-105,': 'events',
			'-1,2,-94,-102,': 'informinfo',
			'-1,2,-94,-108,': 'forminfo',
			'-1,2,-94,-110,': 'kact',
			'-1,2,-94,-117,': 'mact',
			'-1,2,-94,-111,': 'tact',
			'-1,2,-94,-109,': 'doact',
			'-1,2,-94,-114,': 'dmact',
			'-1,2,-94,-103,': 'pact',
			'-1,2,-94,-112,': 'vcact',
			'-1,2,-94,-115,': 'url',
			'-1,2,-94,-106,': 'vel',
			'-1,2,-94,-119,': 'aj',
			'-1,2,-94,-122,': 'mr',
			'-1,2,-94,-123,': 'sed',
			'-1,2,-94,-124,': 'chalenge_C',
			'-1,2,-94,-126,': 'chalenge_E',
			'-1,2,-94,-127,': 'chalenge_S',
			'-1,2,-94,-70,': 'nav_perm',
			'-1,2,-94,-80,': 'fpval',
			'-1,2,-94,-116,': 'fpval_hash',
			'-1,2,-94,-118,': 'o9',
			'-1,2,-94,-121,': 'sensor_hash'
		};
		const vel=["ke_vel+1","me_vel+32", "te_vel+32", "doe_vel", "dme_vel", "pe_vel", "vel_sum", "ms_after_start1","init_time", "start_ts", "fpcf_td", "d2", "ke_cnt", "me_cnt", "d2/6", "pe_cnt", "te_cnt", "ms_after_start2", "ta", "n_ck", "abck", "abck_hash", "rVal", "rCFP", "fas"];
		const uas=["xagg","psub","lang","prod","plen","pen","wen","den","z1","d3","availWidth","availHeight", "width","height","innerWidth","innerHeight","outerWidth","ua_hash","rnd","start_ts/2","loc"];
		const mact={1:"mousemove", 2:"click", 3:"mousedown", 4:"mouseup"};
		const tact={1:"touchmove", 2:"touchstart", 3: "touchend"}
		const pact={3:"pointerdown", 4:"pointerup"};
		const kact={1:"keydown", 2:"keyup", 3:"keypress"};
		const vcact={1:"visibilitychange",2:"onblur",3:"onfocus"};
		let prev=0;
		let list={actions:{}};
		let ta=0, ke_vel=0, me_vel=0, pe_vel=0, te_vel=0, doe_vel=0, dme_vel=0;
		for (let key in keys) {
			let param = str.substring(prev,str.indexOf(key,prev));
			list[keys[key]]=param;
			prev=str.indexOf(key,prev)+key.length;
			if (param=="") continue;
			switch (keys[key]) {
				case "user_agent":
					const bd=param.match(/cpen(.*?)x12\:(\d+)/g,"");
					list["bd"]=bd[0];
					const temp=param.replace(`,${bd[0]},`,"").split(",uaend,");
					list["user_agent"]=temp[0];
					const ua=temp[1].split(",");
					for (let i=0;i<uas.length;i++) {
						list[uas[i]]=ua[i];
					}
				break;
				case "vel": 
					const va=param.split(",");
					for (let i=0;i<vel.length;i++) {
						list[vel[i]]=va[i];
					}
					delete list.vel;
				break;
				case "mact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[2]);
						me_vel+= parseInt(act[0])+ parseInt(act[1]) + parseInt(act[2]) + parseInt(act[3]) + parseInt(act[4]);
						if (!list["actions"][act[2]]) list["actions"][act[2]]="";
						list["actions"][act[2]]+=`${mact[act[1]]} X:${act[3]} Y:${act[4]};`;
					}
				break;
				case "pact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[2]);
						pe_vel+= parseInt(act[0])+ parseInt(act[1]) + parseInt(act[2]) + parseInt(act[3]) + parseInt(act[4]);
						if (!list["actions"][act[2]]) list["actions"][act[2]]="";
						list["actions"][act[2]]+=`${pact[act[1]]} X:${act[3]} Y:${act[4]};`;
					}
				break;
				case "tact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[2]);
						te_vel+= parseInt(act[0])+ parseInt(act[1]) + parseInt(act[2]) + parseInt(act[3]) + parseInt(act[4]);
						if (!list["actions"][act[2]]) list["actions"][act[2]]="";
						list["actions"][act[2]]+=`${tact[act[1]]} X:${act[3]} Y:${act[4]};`;
					}
				break;
				case "doact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[1]);
						doe_vel+= parseInt(act[0])+ parseInt(act[1]);
						if (!list["actions"][act[1]]) list["actions"][act[1]]="";
						list["actions"][act[1]]+='deviceorientation;';
					}
				break;
				case "dmact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[1]);
						dme_vel+= parseInt(act[0])+ parseInt(act[1]);
						if (!list["actions"][act[1]]) list["actions"][act[1]]="";
						list["actions"][act[1]]+='devicemotion;';
					}
				break;
				case "vcact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						if (!list["actions"][act[2]]) list["actions"][act[2]]="";
						list["actions"][act[2]]+=`${vcact[act[1]]};`;
					}					
				break;
				case "kact":
					var acts=param.split(";");
					for (let a of acts) {
						var act=a.split(",");
						if (act.length==1) break;
						ta+=parseInt(act[2]);
						ke_vel+= parseInt(act[0])+ parseInt(act[1]) + parseInt(act[2]) + parseInt(act[3]) + parseInt(act[5]) + parseInt(act[6]);
						if (!list["actions"][act[2]]) list["actions"][act[2]]="";
						list["actions"][act[2]]+=`${kact[act[1]]} CHAR:${act[3]};`;
					}
				break;
			}
		}
		list["timings"]=str.substring(prev+1,str.length);
		let time=0;
		Object.keys(list.actions).sort((a, b) => a - b).forEach((a)=>{
			const ts=a-time;
			console.log(`[${ts}ms] - ${list.actions[a]}`);
		})
		delete list.actions;
		console.log(list);
		if (ta-list["ta"]==0) console.log("TA check passed"); else console.log("TA check failed", ta, (ta-list["ta"]));
		if (list["ke_vel+1"]-ke_vel-1==0) console.log("KE_VEL check passed"); else console.log("KE_VEL check failed", ke_vel, (list["ke_vel+1"]-ke_vel));
		if (list["me_vel+32"]-me_vel-32==0) console.log("ME_VEL check passed"); else console.log("ME_VEL check failed", me_vel, (list["me_vel+32"]-me_vel));
		if (list["te_vel+32"]-te_vel-32==0) console.log("TE_VEL check passed"); else console.log("TE_VEL check failed", te_vel, (list["te_vel+32"]-te_vel));
		if (list["pe_vel"]-pe_vel==0) console.log("PE_VEL check passed"); else console.log("PE_VEL check failed", pe_vel, (list["pe_vel"]-pe_vel));
		if (list["doe_vel"]-doe_vel==0) console.log("DOE_VEL check passed"); else console.log("DOE_VEL check failed", doe_vel, (list["doe_vel"]-doe_vel));
		if (list["dme_vel"]-dme_vel==0) console.log("DME_VEL check passed"); else console.log("DME_VEL check failed", dme_vel, (list["dme_vel"]-dme_vel));
		if (list["vel_sum"]-ke_vel-me_vel-te_vel-pe_vel-doe_vel-dme_vel==0) console.log("VEL SUM check passed"); else console.log("VEL SUM check failed", dme_vel+doe_vel+ke_vel+me_vel+te_vel+pe_vel, (list["vel_sum"]-ke_vel-me_vel-te_vel-pe_vel-dme_vel-doe_vel));
		if (list["start_ts"]%1e7-list["d3"]<2) console.log("D3 check passed"); else console.log("D3 check failed", list["start_ts"]%1e7-list["d3"]);
		let o9=parseInt(list["d3"]);
		for (let i=0;i<5;i++) {
			const a=parseInt(list["d3"].substring(list["d3"].length-1-i,list["d3"].length-i));
			let t=a % 4;
			2 == t && (t = 3);
			let e = String.fromCharCode(42 + t), m = "return a" + e + (a+1) + ";";
			o9=new Function("a", m)(o9);	
		}
		if (o9-list["o9"]==0) console.log("O9 check passed"); else console.log("O9 check failed", o9, list["o9"]-o9);
	}

const sensors = JSON.parse(fs.readFileSync('sensors.txt'));

for (sensor of sensors) {
	parse_sensor(sensor.sensor_data);
}
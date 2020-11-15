class Queue{

	constructor(item){
		this.data=[];
		this.limit=1;
		this.option={
			"status":'waiting',
			"watch":{
				"start":new Date()-0,
				"end":0
			},
			"async":false
		};
		return this.init(item);
	}

	add(item){
		this.data.push( new Queue(item) );
		return this;
	}
	init(item){
		var self=this;
		if(!item){ return this; }
		if(Object.prototype.toString.call(item)==='[object Array]'){
			_(item).each(val=>{
				self.add( val );
			});
		}else{
			if(!!item.async){
				this.option.async=true;
			}
			this.data.push( item );
		}
		return this;
	}

	study(){
		var self=this;
		var $queue=this;
		var loading=0;
		var dead=0;
		var complete=0;
		var async=0;

		_(this.data).each((i,val)=>{
			var item$que=val;
			var status=item$que.option.status;

			if(status==='waiting'){
				if(!!item$que.option.async){
					if(async>=self.limit){ return; }
					async++;
					item$que.option.status='async';
				}
				else{
					if(loading>=1){ return; }
					loading++;
					item$que.option.status='loading';
				}

				item$que.option.watch.start=new Date()-0;
				item$que.eq(0).callback.call(item$que.eq(0),i,item$que,$queue);
			}
			else if(status==='loading'){
				loading++;
			}
			else if(status==='async'){
				async++;
			}
			else if(status==='complete'){
				complete++;
				item$que.option.watch.end=new Date()-0;
			}
			else if(status==='dead'){
				dead++;
			}
		});
	}
	lap(){
		return (new Date()-0)-this.option.watch.start;
	}
	createTTxt(dms){
		var h=dms/3600000|0,
			m=(dms/60000)%60|0,
			s=(dms%60000/1000)|0;
		return [`${h<=9?"0":""}${h}`,`${m<=9?"0":""}${m}`,`${s<=9?"0":""}${s}`].join(':');
	}
	progressTime(){
		var lap=this.lap();
		return {
			"dms":lap,
			"ttxt":this.createTTxt(lap)
		};
	}
	remainingTime(percent){
		var lap=this.lap();
		var rt=Math.abs( lap*( 1-(1/(percent/100)) ) )|0;
		return {
			"dms":rt,
			"ttxt":this.createTTxt(rt)
		};
	}
	complete(callback){
		this.option.status="complete";
		if(callback){
			callback.call(this,i,this);
		}
	}
	dead(callback){
		this.option.status="dead";
		if(callback){
			callback.call(this,i,this);
		}
	}
	reset(async){
		_(this.data).each(item$que$=>{
			var status=item$que$.option.status;
			if(status==="complete" && !item$que$.option.async){
				item$que$.option.status="waiting";
			}
			if(!!async &&  status==="complete" && !!item$que$.option.async){
				item$que$.option.status="waiting";
			}
		});
		return this;
	}
	isComplete(async){
		var length=this.data.length;
		var complete_count=0;
		var async_count=0;
		var async_complete_count=0;
		_(this.data).each(item$que$=>{
			if(item$que$.option.status==="complete"){ complete_count++; }
			if(item$que$.option.async){
				async_count++;
				if(item$que$.option.status==="complete" || item$que$.option.status==="dead"){
					async_complete_count++;
				}
			}
		});
		if(!async){
			return complete_count===length?true:false;
		}else{
			return async_count===async_complete_count?true:false;
		}
	}

	eq(i){
		return this.data[i];
	}

}
window.queue=function(item){ return new Queue(item) };

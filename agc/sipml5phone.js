/*
CHANGELOG:
------

Edited on 2014-03-30
by navaismo@gmail.com

Added Handling to CANCEL SIP Message
Added latest Version of SIPML5
Added SVN to the URL
------

Edited on 2014-05-15
by navaismo@gmail.com

Added feature request for MUTE Microphone
------

*/     
	//Variables
	var mySipStack;
        var mycallSession;
        var mychatSession;
	var myregisterSession;
	var flag = '0';
	
	//Register Variables sipml5
	var myrealm = 'asterisk';
	var myusn = '777';
	var mysipuri = 'sip:777@10.0.10.18';
	var mycid = '777';
	var mywebsocket = 'ws://v18.mycallcloud.com:10060';
	var mybreaker = 'yes';
	var mypwd = 'mcc777';


	var oConfigCall = {
		audio_remote: document.getElementById('audio_remote'),
                audio_local: document.getElementById('audio_local'),
                events_listener: { events: '*', listener: calllistener } // optional: '*' means all events
	};


	// readycallback for INIT
	var readyCallback = function(e){
		console.log("engine is ready");
		//CHeck if the SIPml start
		if(SIPml.isInitialized() == 1){
			console.log("Done to initialize the engine");
			//If the stack is started, create the sip stack
			startSipStack();
		}else{
			//If not started display console msg
			console.log("Failed to initialize the engine");
		}        		
	}

	// error callback for INIT
	var errorCallback = function(e){
		console.error('Failed to initialize the engine: ' + e.message);
	}

	//INIT SIPML5 API
	SIPml.init(readyCallback, errorCallback);

	//Here we listen stack messages
	function listenerFunc(e){
		//Log incoming messages
		tsk_utils_log_info('==stack event = ' + e.type);
		
		switch(e.type){
		
			//If failed msg or error Log in console & Web Page
			case 'failed_to_start': case 'failed_to_stop':  case 'stopping': case 'stopped': {

				console.log("Failed to connect to SIP SERVER")
				mycallSession = null;
				mySipStack = null;
				myregisterSession = null;
	
				("#mysipstatus").html('');
				("#mysipstatus").html('<i>Disconnected: </i>'+e.description);
				
				break;
			}

			//If the msg is 'started' now try to Login to Sip server       				
	        	case 'started': {
	        	        console.log("Trying to Login");


				login();//function to login in sip server
	
				//Display msg in the web page
				("#mysipstatus").html('');
				("#mysipstatus").html('<i>Trying to Connect</i>');
			
				break;
			}

			//If the msg 'connected' display the register OK in the web page 
			case 'connected':{
				("#mysipstatus").html('');
				("#mysipstatus").html('<i>Registered with Sip Server</i>');

				break;
			}

			//If the msg 'Sent request' display that in the web page---Pattience
			case 'sent_request':{

				("#mysipstatus").html('');
				("#mysipstatus").html('<i>'+e.description+'</i>');

				break;
			}

			//If the msg 'terminated' display that on the web---error maybe?
			case 'terminated': {
				
				 ("#btnCall").text('Call');
                                 ("#btnHangUp").text('Hangup');

				//added
				stopRingbackTone();
                                stopRingTone();
				mycallSession = null;

				break;
			}

			//If the msg 'i_new_call' the browser has an incoming call
			case 'i_new_call': {
				 if (mycallSession) {
		                        // do not accept the incoming call if we're already 'in call'
                		        e.newSession.hangup(); // comment this line for multi-line support
					console.log("*********************** not accepted");
		                }else{

					//Change buttons values
					("#btnCall").text('Answer');
					("#btnHangUp").text('Reject');

					console.log("***********************incoming call");
               	                	flag ='1';
					mycallSession = e.newSession;


					console.log("***********************Start Ringing");
					//Start ringing in the browser
                	       		startRingTone();

					mycallSession.setConfiguration(oConfigCall);

	
				
					//Display in the web page who is calling
			                var sRemoteNumber = (mycallSession.getRemoteFriendlyName() || 'unknown');
        			        $("#mycallstatus").html("<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>");
                			//showNotifICall(sRemoteNumber);
				}
				break;
			}
                        case 'i_new_message': {

                                       	console.info('++++++++ Receiving SIP SMS +++++++++++++');
                                       	mychatSession = e.newSession;
                                       	mychatSession.accept();

                                        console.info('IMmsg = '+e.getContentString()+' IMtype = '+e.getContentType());
                                        //$("#recchat").html($("#recchat").text()+e.getContentString()+"\n");
                                        //$('#recchat').scrollTop($('#recchat')[0].scrollHeight);

					$("#chatarea").html($("#chatarea").html()+"<b>"+e.getContentString()+"</b>");
                                	$('#chatarea').scrollTop($('#chatarea')[0].scrollHeight);

					newmessageTone();
					//destroy the call session
					mychatSession.hangup
		                        mychatSession = null;
	
                              break;
                        }


			case 'm_permission_requested':{
                        	break;
                	}
            		case 'm_permission_accepted':
		        case 'm_permission_refused': {
				if(e.type == 'm_permission_refused'){

					$("#btnCall").text('Call');
                                        $("#btnHangUp").text('Hangup');	
				        btnCall.disabled = false;
				        btnHangUp.disabled = true;

				        mycallSession = null;

				        stopRingbackTone();
				        stopRingTone();

				         $("#mysipstatus").html("<i>" + s_description + "</i>");

                    		}
                    		break;
                	}
			case 'starting': default: break;
        	}           	
	}

	//Function to Listen the call session events
	function calllistener(e){
		//Log all events
		tsk_utils_log_info('****call event**** = ' + e.type);

		switch(e.type){

			//Display in the web page that the call is connecting
			case 'connected': case 'connecting': {

			     var bConnected = (e.type == 'connected');
                    		if (e.session == myregisterSession) {		                        
                         		$("#mycallstatus").html("<i>" + e.description + "</i>");
					$("#btnHangup").text('Hangup');
				
                    		}else if (e.type == 'connecting') {		                        
                         		$("#mycallstatus").html("<i>" + e.description + "</i>");
		                	$("#btnHangup").text('Hangup');

				}else if (e.session == mycallSession) {
					$("#btnHangup").text('Hangup');
	      		                
					if (bConnected) {
        		 	               stopRingbackTone();
                        			stopRingTone();
						$("#btnHangup").text('Hangup');

					}
                            	}
				break;
                        }
		
			//Display in the browser heh call is finished
			case 'terminated': case 'terminating': {
					console.log('***********Ending the CALL!!!!');
       					$("#btnHangUp").text('Hangup');
       					$("#btnCall").text('Call');
					flag='0';

				//edited 2014-03-30
				//if (e.session == mycallSession) {
				if (e.session == myregisterSession) {
					console.log('***********Session DUMMY 1 onREG Terminating');
		                        mycallSession = null;
              			        myregisterSession = null;

                        		$("#mycallstatus").html("<i>" + e.description + "</i>");
				        stopRingbackTone();
				        stopRingTone();
					$("#btnHangup").text('Hangup');
					hangup();


		               }else if (e.session == mycallSession) {
					console.log('*****Session DUMMY 2 OnCALL Terminating');
                        		$("#mycallstatus").html("<i>" + e.description + "</i>");
       					$("#btnHangup").text('Hangup');
       					$("#btnCall").text('Call');
				        mycallSession = null;
				        stopRingbackTone();
				        stopRingTone();
					hangup();
                	       }
				break;
                
			}		

			// future use with video
		         case 'm_stream_video_local_added': {
		                    if (e.session == mycallSession) {

                    		    }
                    		break;
                	}
	
			//future use with video
	               case 'm_stream_video_local_removed': {
		                    if (e.session == mycallSession) {

                    		    }
                    		break;
                	}
			
			//future use with video
		       case 'm_stream_video_remote_added':  {
		                    if (e.session == mycallSession) {

                    		    }
	                        break;
            		}
		
			//future use with video
		        case 'm_stream_video_remote_removed': {
		                    if (e.session == mycallSession) {

                    		    }
                    		break;
                	}
	
			//added media audio todo messaging
	                case 'm_stream_audio_local_added':
			case 'm_stream_audio_local_removed':
		        case 'm_stream_audio_remote_added':
		        case 'm_stream_audio_remote_removed': {
		        	//$("#btnCall").text('Call');
                                //$("#btnHangup").text('Hangup');

		               	//stopRingTone();                   
	                        //stopRingbackTone();
	
                    		break;
                	}

			//If the remote end send us a request with SIPresponse 18X start to ringing
			case 'i_ao_request':{
	                        var iSipResponseCode = e.getSipResponseCode();
				console.log('************RESPONSE CODE: iSipResponseCode');
        	               	if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                			startRingbackTone(); //function to start the ring tone
					$("#mycallstatus").html('');
                            		$("#mycallstatus").html('<i>Remote ringing...</i>');
					//$("#btnHangUp").show();
	                       	}
				break;
			}
           
			// If the remote send early media stop the sounds
			case 'm_early_media': {
	                	if (e.session == mycallSession){ 
				      	stopRingTone();                   
        		                stopRingbackTone();
					$("#mycallstatus").html('');
					$("#mycallstatus").html('<i>Call Answered</i>');
                                        $("#btnCall").text('Call');		                        
					$("#btnHangup").text('Hangup');


				}
				break;
			}

			default: {

				console.log('++++++++++++++++WTF with this received type' + e.type);
				break;
			}
                }

	}

	//function to send the SIP Register
	function login(){
		//Show in the console that the browser is trying to register
		console.log("Registering");
		
		//create the session
        	myregisterSession = mySipStack.newSession('register', {
                	events_listener: { events: '*', listener: listenerFunc } // optional: '*' means all events
                });

		//send the register
	       myregisterSession.register();
	}

	// function to create the sip stack
	function startSipStack(){
		//show in the console that th browser is trying to create the sip stack
		console.info("attempting to start the SIP STACK with: "+ mysipuri +" "+mywebsocket);

		//stack options
		mySipStack  = new SIPml.Stack({
		        realm: myrealm,
		        impi: myusn,
		        impu: mysipuri,
		        password: mypwd, // optional
		        display_name: mycid, // optional
		        websocket_proxy_url: mywebsocket, // optional
		        //outbound_proxy_url: 'udp://10.0.1.105:5060', // optional
		        //ice_servers: [{ url: 'stun:stun.l.google.com:19302'}, { url:'turn:user@numb.viagenie.ca', credential:'myPassword'}], // optional
		        enable_rtcweb_breaker: mybreaker, // optional
		        enable_click2call: false, // optional
		        events_listener: { events: '*', listener: listenerFunc }, //optional
		        sip_headers: [ //optional
		            {name: 'User-Agent', value: 'DM_SIPWEB-UA'}, 
		            {name: 'Organization', value: 'Digital-Merge'}
		        ]
    		});
		//If the stack failed show errors in console
		if (mySipStack.start() != 0) {
                	console.info("Failed to start Sip Stack");
            	}else{
                	console.info("Started the Sip Stack");
		}
	
	}


 function call(){

	//$("#btnCall").text('Call');
        $("#btnHangup").text('Hangup');

                 
	if (flag=='0' && mySipStack && $("#callnumber").val() != ''){
	       //create the session to call
                        mycallSession = mySipStack.newSession('call-audio', {
                                audio_remote: document.getElementById('audio_remote'),
                                audio_local: document.getElementById('audio_local'),
                                video_remote: document.getElementById('video_remote'),
                                video_local: document.getElementById('video_local'),
                                events_listener: { events: '*', listener: calllistener } // optional: '*' means all events
                        });

                        //call using the number in the textbox
                        mycallSession.call($("#callnumber").val());

	}else if(flag=='0' && mySipStack && $("#callnumber").val() == ''){
		alert('Please Digit the destination Number');
	}

		if( flag =='1' && mySipStack && mycallSession){

			$("#btnHangup").text('Hangup');
                        //$("#btnCall").text('Call');

                        stopRingbackTone();
                        stopRingTone();


                        //Accept the session call
                        mycallSession.accept({
                                audio_remote: document.getElementById('audio_remote'),
                                audio_local: document.getElementById('audio_local'),
                                events_listener: { events: '*', listener: calllistener } // optional: '*' means all events
                        });
		
                }

        }





	//function to hangup the call
	function hangup(){
		//If exist a call session, hangup and reset button values
		if(mycallSession){
	        	mycallSession.hangup({events_listener: { events: '*', listener: calllistener }});
                        stopRingbackTone();
                     	stopRingTone();                   
			$("#btnHangup").text('Hangup');
			$("#btnCall").text('Call');

			$("#callnumber").attr('value','');
			$("#mycallstatus").html("Call Terminated")
			//destroy the call session
			mycallSession = null;
			flag='0';

		}else{
			$("#callnumber").attr('value','');
		}			
		
	}

	//Fucntion to send DTMF frames
	function sipSendDTMF(c){
        	if(mycallSession && c){
            		if(mycallSession.dtmf(c) == 0){
				var lastn = $("#callnumber").val();
				$("#callnumber").val( lastn + c );

               			try { dtmfTone.play(); } catch(e){ }
            		}
        	}else{
			var lastn = $("#callnumber").val();

			$("#callnumber").val( lastn + c );
       			try { dtmfTone.play(); } catch(e){ }

		}
		
			
    	}


	//function to send messages
                var messageSession;
                var IMListener = function(e){
                        console.info('session event='+e.type);
                }


        function sendIM(){
                var IMtext = $("#sendchat").val();

                if( IMtext == ''  && mySipStack ){
                        console.log('Empty string on IM');
                        alert('Cant send empty Message');

                }else if( IMtext != '' && mySipStack ){
                        console.log('We can send IM+++++++');
                                messageSession = mySipStack.newSession( 'message',{
                                        events_listener: { events: '*', listener: IMListener}
                                });
				var dtime = new Date();
				var outtime = dtime.getHours()+":"+dtime.getMinutes+":"+dtime.getSeconds;
                                console.log('trying to send IM++++');
				var myvalpeer = $("#chatpeers").val();
				var mypeer = myvalpeer.split("/");
                                //messageSession.send($("#chatpeers").val(),$("#sendchat").val(),'text/plain;charset=utf-8');
                                messageSession.send(mypeer[1],$("#sendchat").val(),'text/plain;charset=utf-8');
				//$("#recchat").html($("#recchat").text()+'('+outtime+')'+$("#sendchat").val()+"\n");
				//$("#recchat").html($("#recchat").text()+'>'+$("#sendchat").val()+"\n");
                                //$('#recchat').scrollTop($('#recchat')[0].scrollHeight);

				$("#chatarea").html($("#chatarea").html()+"<p>> "+$("#sendchat").val()+"</p>");
                                $('#chatarea').scrollTop($('#chatarea')[0].scrollHeight);
                                $("#sendchat").val('');


                }else if( IMtext != '' && !mySipStack ){
                        console.log('We cannot send IM+++++++');
			alert('stack not ready');
		 }

        }

/**************** mute from https://code.google.com/p/sipml5/issues/detail?id=67 ********************************/
function muteMicrophone(bEnabled) {
	var invbEnabled;
	if(bEnabled){
		invbEnabled=false;
	}else{
		invbEnabled=true;
		
	}



    console.log("-->>>> muteMicrophone=" + invbEnabled);
    if (mycallSession != null) {
         console.log("-->>>> muteMicrophone-> mycallSession is valid");
        if (mycallSession.o_session != null) {
            console.log("-->>>> muteMicrophone-> mycallSession.o_session is valid");
            if (mycallSession.o_session.o_stream_local != null) {
                console.log("-->>>> muteMicrophone-> mycallSession.o_session.o_stream_local is valid");
                if (mycallSession.o_session.o_stream_local.getAudioTracks().length > 0) {
                    console.log("-->>>> muteMicrophone-> mycallSession.o_session.o_stream_local->Audio Tracks Greater than 0");
                    for (var nTrack = 0; nTrack < mycallSession.o_session.o_stream_local.getAudioTracks().length ; nTrack++) {
                      console.log("-->>>> muteMicrophone-> Setting Audio Tracks [" + nTrack + "] to state = " + invbEnabled);
                        mycallSession.o_session.o_stream_local.getAudioTracks()[nTrack].enabled = invbEnabled;
                    }
                }
                else {
                    console.log("-->>>> muteMicrophone-> mycallSession.o_session.o_stream_local-> NO AUDIO TRACKS");
                }
            }
            else {
                console.log("-->>>> muteMicrophone-> mycallSession.o_session.o_stream_local is NULL");
            }
        }
        else {
            console.log("-->>>> muteMicrophone-> mycallSession.o_session is NULL");
        }
    }
    else {
        console.log("-->>>> muteMicrophone-> mycallSession  is NULL");
    }
}






/**************** fucntion to play sounds *******************/
    function startRingTone() {
        try { ringtone.play(); }
        catch (e) { }
    }

    function stopRingTone() {
        try { ringtone.pause(); }
        catch (e) { }
    }

    function startRingbackTone() {
        try { ringbacktone.play(); }
        catch (e) { }
    }

    function stopRingbackTone() {
        try { ringbacktone.pause(); }
        catch (e) { }
    }

    function newmessageTone() {
        try { newmsg.play(); }
        catch (e) { }
    }


 function handleKeyPress(e){
        var key=e.keyCode || e.which;
        if (key==13){
        sendIM();
        }
  }


	$("#chatpeers").live('change',function(){
		//$("#recchat").text('');
		$("#chatarea").html('');
		$("#sendchat").focus();
	});
DUE TO THE SSL CHANGES IN FIREFOX AND CHROME THIS BUILD IS NO LONGER VALID

***********************************************************************************************************************************
*    This Document is a guide to this repo 
*    https://github.com/noahseis/webrtc2sip.git
*    
*    Built from source from doubango telecom for MyCallCloud.com and provided here at github for open source downloads.
*    Please READ through it's a bit of long install process, but take your time, follow the steps and guidance and you will succeed. 
*    Credits for help and assistance go to navaismo
*
*	And these 2 web resources:
*	https://code.google.com/p/doubango/wiki/Building_Source_v2_0
*	http://geekforum.wordpress.com/2013/06/06/build-and-install-doubango-webrtc2sip/
*
*    Dev contact: noah@mycallcloud.com 720-620-4014
*    
*    1. Installation steps for webrtc2sip gateway to asterisk
*    2. Webphone copied into the correct locations
*    3. js assets and sounds folder to support the html/javsscript web phone
*
*    Hi All Vici / WebRTC hopefuls - Installed tested and working webrtc2sip with no asterisk patching
***********************************************************************************************************************************


***********************************************************************************************************************************
Version installed and tested with:
ViciBox Redux v.5.0.2-130821 (zypper up && zypper refresh to grab the latest and greatest before vicibox-install)
1.8.29.0-vici asterisk
(Standard Install)
Install and testing was done to an external ip vicibox with 1 to 1 natting and appropriate iptables firewalling 
Tested with latest version of chrome on WinXP
Tested with a Chromebook (fantastic)
Tested with latest version of Firefox on WinXP
***********************************************************************************************************************************

Preface:
---------------------------------------------------------------------------------------------------------------------------------------------------
Needed and Wanted html 5 webphone / WebRTC, not java, not active x, not flash based phone.
Wanted to keep 1.8.29.0-vici asterisk unchanged for performance and stability.
The main purpose for us was to get to a web phone app where agents could nail up voice on login, and not necessarily to use the web phone for general outbound calling, again to use it for the purpose of nailed up voice on agent login. 

(since this is a javascript implementation and html 5 this should work theoretically on any device and browser that supports html5 and WebRTC)


Summary of findings and some narrative:
---------------------------------------------------------------------------------------------------------------------------------------------------
Webrtc2sip will act as a gateway to asterisk converting websocket connections and handing off SDP instruction to any version of asterisk. 
Asterisk does not need to be modified patched or otherwise changed from a source code perspective. Some adjustments to .conf are helpful. 
Upon testing, have not seen an increase in load on the server, no voice degradation.
The key here is don't trans-code. No trans-coding = low load / no load. Use ulaw or you can compile the gateway with g729 if you need to and have g729 compiled and loaded our your vici asterisk flavor. 

With the advent of DTLS and SRTP (Forced in the new versions of Chrome and Firefox) - the gateway handshakes these secure protocols with the WEBRTC request, and hands off the SDP to asterisk for a connection and voice delivery. 

The settings for the webphone are instructions to let the gateway know where to hand off the SDP. 
Again the gateway doesn't need to be installed with any codecs if you are using ulaw, just ssl and srtp

******************************************************************************Ok Enough let's get to the install part******************************
Instructions to setup gateway:
---------------------------------------------------------------------------------------------------------------------------------------------------
Below is a simple set of instructions to get you started:

This short guide below is for vicidial with PCMU codec and just voice no video using doubango and webrtc2sip gateway.

Do this first:

Follow the instructions below:
1. 
# cd /usr/src 

2. Get the repo
# git clone https://github.com/noahseis/webrtc2sip.git

3. Add using yast and add the tools that are needed 
(Make sure all these are added) Use phrase search software manager in yast to find these packages to install. 

 
libtool 
cvs 
libogg-devel 
gcc-c++ 
libxml2-devel 
libopenssl-devel
libsrtp-devel
libsrtp2 (Need to get this external to repo)



4. You have to build a self signed cert for the secure handshake (realm is asterisk)
Visit these links and build your cert key ans Self Signed Cert
 http://codeghar.wordpress.com/2013/04/16/create-private-certificate-authority-on-linux/ 
 http://codeghar.wordpress.com/2013/04/16/generate-certificate-signing-request-on-linux/  
 http://codeghar.wordpress.com/2013/04/16/use-private-certificate-authority-to-sign-certificate-signing-request-on-linux/

		Some of these steps are in the tutorials links above
		mkdir -p /home/cg/myca && cd /home/cg/myca && mkdir private certs newcerts conf export csr
		mkdir -p /home/cg/mycert && cd /home/cg/mycert && mkdir private conf csr

		copy in certs and self signed 
		cd /home/cg/mycert/private copy in key.csr.server1.pem
		cd /home/cg/myca/certs copy in crt.ca.cg.pem and crt.server1.pem

5. 
This is where you can add other flags to build doubango with different codecs for voice and video. Also with -with flag can be changed to provide source to packages like openssl (already installed with vici isos) You need source files uncomplied from what I’ve gathered. 
(the doubango ./configure is going to be looking for your flagged add ons here /usr/local unless you specify path: example -with-ssl=PATH -with-srtp=PATH )

# cd /usr/src/webrtc2sip/doubango-source/branches/2.0/doubango 
# export LDFLAGS="$LDFLAGS -ldl"
# ./autogen.sh && ./configure -with-srtp=/usr/include/srtp/ -with-ssl=/usr/include/openssl

(Note: After the configure confirm these 3 are yes)
SSL:                 yes
DTLS-SRTP:           yes
DTLS:                yes


# make && make install
(IF YOU GET ERRORS DON'T CONTINUE, figure it out before moving on past this point)

6.
# cd /usr/src/webrtc2sip/webrtc2sip/
# export PREFIX=/opt/webrtc2sip && ./autogen.sh && CFLAGS='-lpthread' ./configure -prefix=$PREFIX -with-doubango=/usr/local
# make clean && make -ldl -lpthread && make install
# cp -f ./config.xml $PREFIX/sbin/config.xml

edit (nano vi your flav) config.xml - the edit is below
# vi /opt/webrtc2sip/sbin/config.xml


<?xml version="1.0" encoding="utf-8" ?>
<!-- Please check the technical guide (http://webrtc2sip.org/technical-guide-1.0.pdf) for more information on how to adjust this file -->
<config>

<debug-level>INFO</debug-level>

<transport>udp;*;10060</transport>
<transport>ws;*;10060</transport>
<transport>wss;*;10062</transport>
<!--transport>tcp;*;10063</transport-->
<!--transport>tls;*;10064</transport-->

<enable-rtp-symetric>yes</enable-rtp-symetric>
<enable-100rel>no</enable-100rel>
<enable-media-coder>yes</enable-media-coder>
<enable-videojb>yes</enable-videojb>
<video-size-pref>vga</video-size-pref>
<rtp-buffsize>65535</rtp-buffsize>
<avpf-tail-length>100;400</avpf-tail-length>
<srtp-mode>optional</srtp-mode>
<srtp-type>dtls</srtp-type>
<dtmf-type>rfc4733</dtmf-type>

<codecs>pcmu</codecs>
<codec-opus-maxrates>48000;48000</codec-opus-maxrates>
<!--unused codecs opus;pcma;gsm;vp8;h264-bp;h264-mp;h263;h263+ --> 

<stun-server>stun.l.google.com;19302;stun-user@doubango.org;stun-password</stun-server>
<enable-icestun>yes</enable-icestun>

<max-fds>-1</max-fds>

<nameserver>8.8.8.8</nameserver>

<ssl-certificates>
/home/cg/mycert/private/key.csr.server1.pem;
/home/cg/myca/certs/crt.server1.pem;
*;
no
</ssl-certificates>

<!-- ***CLICK-TO-CALL SERVICE*** -->

<transport>c2c;*;10070</transport>
<transport>c2cs;*;10072</transport>
<database>sqlite;*</database>
<!--account-mail>smtps;*;*;auth.smtp.1and1.fr;465;noreply@example.com;noreply@example.com;mysecret</account-mail-->
<!--account-sip-caller>*;sip:a@example.com;a;example.com;mysecret</account-sip-caller-->

</config>

7. To run the gateway 
(Change the config.xml to INFO vs Error for more verbose debug)
# PATH=$PATH:/opt/webrtc2sip/sbin
# webrtc2sip --config=/opt/webrtc2sip/sbin/config.xml

*******************************Not even needed!!*****************************************
		8. Change Sip.conf
		sip.conf changes:
		realm=asterisk ; Realm for digest authentication
		bindaddr=0.0.0.0 ; IP address to bind to (0.0.0.0 binds to all)
		
		Conf extensions custom for the phone through the web admin interface for vici
		type=friend
		secret=*****
		context=default
		host=dynamic
		disallow=all
		allow=all
		videosupport=no
		qualify=yes (or no either worked fine I suspect yes will keep ports open on firewalls if you have short timers)
		callerid="wrtc" <777>
		nat=no
*******************************END Not even needed!!*****************************************

9. SipMl5 Settings Test this before installing the Web phone in Vici.
Login to sipml5.org/call.htm with setting guidance below:
sipml5 web phone settings
Display Name: 777
Private Identity*: 777
Public Identity*: sip:777@lan side ip of the asterisk
Password: ******
Realm*: asterisk

Expert Mode:
Disable Video: Check
Enable RTCWeb Breaker[1]: Check
WebSocket Server URL[2]: ws://externalip or dns name:10060
SIP outbound Proxy URL[3]:udp://lan side of the asterisk (for making a call out of the web phone) 

The web phone should prompt for allow mic and then you'll need to click the answer button. Wa LA

(NOTE In the console windows for webrtc2sip you should see this:)
*INFO: Receive RTP-DTLS data on ip=10.0.20.199 and port=57856
*INFO: Receive DTLS data: 1229
*INFO: _tnet_dtls_verify_cert
*INFO: _tnet_dtls_verify_cert
*INFO: Audio producer not started yet
*INFO: Audio producer not started yet
*INFO: Audio producer not started yet
*INFO: Audio producer not started yet
*INFO: Audio producer not started yet
*INFO: Audio producer not started yet
*INFO: DTLS data handshake to send with len = 91, ip = 10.0.20.56 and port = 3147
*INFO: DTLS data handshake sent len = 91
*INFO: DTLS handshake completed
*INFO: event_dtls_srtp_profile_selected: SRTP_AES128_CM_SHA1_80
*INFO: dtls.srtp_connected=1, dtls.srtcp_connected=1
*INFO: srtp_use_different_keys=false
*INFO: !!DTLS-SRTP started!!
*INFO: dtls.srtp_handshake_succeed=1, dtls.srtcp_handshake_succeed=1
*INFO: DTLS-DTLS-SRTP socket [10.0.20.199]:57856 handshake succeed
*INFO: Using symetric RTCP for [10.0.20.199]:10843



How to create a service to start webrtc2sip
------------------------------------------------------------
1. First quit the webrtc2sip console and then dupliacate cron.service in /usr/lib/systemd/system
# quit
# cp /usr/lib/systemd/system/cron.service /usr/lib/systemd/system/webrtc2sip.service

2. Create a Link
# ln -s /usr/lib/systemd/system/webrtc2sip.service /etc/systemd/system/multi-user.target.wants/wertc2sip.service

3. nano vi or your flavor /usr/lib/systemd/system/webrtc2sip.service
Edit [Unit] section to change description leave the rest alone
[Unit]
Description=Webrtc2sip For Vici
After=syslog.target mail-transfer-agent.target ypbind.service nscd.service network.target


edit the [Service] section to this:
ExecStart=/opt/webrtc2sip/sbin/webrtc2sip --config=/opt/webrtc2sip/sbin/config.xml


4. Enable start and confirm
# systemctl enable webrtc2sip.service
# systemctl start webrtc2sip 

5. Confirm with:
# service webrtc2sip status

IF it's running that's a good sign.
If it's not running check your steps above for correctness or adjustments to your linux enviornment

6. Reboot
# reboot 

7. To confirm then check after reboot

# service webrtc2sip status

How to add the web phone to vicidial agent
------------------------------------------------------------
Copy these 2 files.
# cp /usr/src/webrtc2sip/agc/webrtc.php /srv/www/htdocs/agc/webrtc.php
# cp /usr/src/webrtc2sip/agc/webrtclaunch.php /srv/www/htdocs/agc/webrtclaunch.php

Make the edits to apply to your public ip in file webrtclaunch.php
$servers = array("YOUR External DNS Address","YOUR External DNS Address");

Make the edit toward the top of the file for webrtc.php
$ExternalServerDNS='Your External DNS Server';


# mkdir /srv/www/htdocs/agc/sounds && mkdir /srv/www/htdocs/agc/assets

Copy for javascript library support and sound support for the webphone found in the repo under
# cp -r /usr/src/webrtc2sip/doubango-source/branches/2.0/doubango/website/assets/* /srv/www/htdocs/agc/assets
# cp /usr/src/webrtc2sip/sounds/* /srv/www/htdocs/agc/sounds
# cp -r /usr/src/webrtc2sip/agc/* /srv/www/htdocs/agc/



NOT NEEDED - Make the change to the extension for web phone in the custom conf for each extension
Set the url to use the web phone in system settings

Good luck
noah@mycallcloud.com
720-620-4014


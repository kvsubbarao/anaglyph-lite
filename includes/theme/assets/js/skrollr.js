(function(window,document,undefined){var skrollr=window.skrollr={get:function(){return _instance},init:function(options){return _instance||new Skrollr(options)},VERSION:"0.6.21"};var hasProp=Object.prototype.hasOwnProperty;var Math=window.Math;var getStyle=window.getComputedStyle;var documentElement;var body;var EVENT_TOUCHSTART="touchstart";var EVENT_TOUCHMOVE="touchmove";var EVENT_TOUCHCANCEL="touchcancel";var EVENT_TOUCHEND="touchend";var SKROLLABLE_CLASS="skrollable";var SKROLLABLE_BEFORE_CLASS=SKROLLABLE_CLASS+"-before";var SKROLLABLE_BETWEEN_CLASS=SKROLLABLE_CLASS+"-between";var SKROLLABLE_AFTER_CLASS=SKROLLABLE_CLASS+"-after";var SKROLLR_CLASS="skrollr";var NO_SKROLLR_CLASS="no-"+SKROLLR_CLASS;var SKROLLR_DESKTOP_CLASS=SKROLLR_CLASS+"-desktop";var SKROLLR_MOBILE_CLASS=SKROLLR_CLASS+"-mobile";var DEFAULT_EASING="linear";var DEFAULT_DURATION=1E3;var DEFAULT_MOBILE_DECELERATION=.004;var DEFAULT_SMOOTH_SCROLLING_DURATION=200;var ANCHOR_START="start";var ANCHOR_END="end";var ANCHOR_CENTER="center";var ANCHOR_BOTTOM="bottom";var SKROLLABLE_ID_DOM_PROPERTY="___skrollable_id";var rxTouchIgnoreTags=/^(?:input|textarea|button|select)$/i;var rxTrim=/^\s+|\s+$/g;var rxKeyframeAttribute=/^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/;var rxPropValue=/\s*([\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi;var rxPropEasing=/^([a-z\-]+)\[(\w+)\]$/;var rxCamelCase=/-([a-z])/g;var rxCamelCaseFn=function(str,letter){return letter.toUpperCase()};var rxNumericValue=/[\-+]?[\d]*\.?[\d]+/g;var rxInterpolateString=/\{\?\}/g;var rxRGBAIntegerColor=/rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g;var rxGradient=/[a-z\-]+-gradient/g;var theCSSPrefix="";var theDashedCSSPrefix="";var detectCSSPrefix=function(){var rxPrefixes=/^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;if(!getStyle)return;var style=getStyle(body,null);for(var k in style){theCSSPrefix=k.match(rxPrefixes)||+k==k&&style[k].match(rxPrefixes);if(theCSSPrefix)break}if(!theCSSPrefix){theCSSPrefix=theDashedCSSPrefix="";return}theCSSPrefix=theCSSPrefix[0];if(theCSSPrefix.slice(0,1)==="-"){theDashedCSSPrefix=theCSSPrefix;theCSSPrefix={"-webkit-":"webkit","-moz-":"Moz","-ms-":"ms","-o-":"O"}[theCSSPrefix]}else theDashedCSSPrefix="-"+theCSSPrefix.toLowerCase()+"-"};var polyfillRAF=function(){var requestAnimFrame=window.requestAnimationFrame||window[theCSSPrefix.toLowerCase()+"RequestAnimationFrame"];var lastTime=_now();if(_isMobile||!requestAnimFrame)requestAnimFrame=function(callback){var deltaTime=_now()-lastTime;var delay=Math.max(0,1E3/60-deltaTime);return window.setTimeout(function(){lastTime=_now();callback()},delay)};return requestAnimFrame};var polyfillCAF=function(){var cancelAnimFrame=window.cancelAnimationFrame||window[theCSSPrefix.toLowerCase()+"CancelAnimationFrame"];if(_isMobile||!cancelAnimFrame)cancelAnimFrame=function(timeout){return window.clearTimeout(timeout)};return cancelAnimFrame};var easings={begin:function(){return 0},end:function(){return 1},linear:function(p){return p},quadratic:function(p){return p*p},cubic:function(p){return p*p*p},swing:function(p){return-Math.cos(p*Math.PI)/2+.5},sqrt:function(p){return Math.sqrt(p)},outCubic:function(p){return Math.pow(p-1,3)+1},bounce:function(p){var a;if(p<=.5083)a=3;else if(p<=.8489)a=9;else if(p<=.96208)a=27;else if(p<=.99981)a=91;else return 1;return 1-Math.abs(3*Math.cos(p*a*1.028)/a)}};function Skrollr(options){documentElement=document.documentElement;body=document.body;detectCSSPrefix();_instance=this;options=options||{};_constants=options.constants||{};if(options.easing)for(var e in options.easing)easings[e]=options.easing[e];_edgeStrategy=options.edgeStrategy||"set";_listeners={beforerender:options.beforerender,render:options.render};_forceHeight=options.forceHeight!==false;if(_forceHeight)_scale=options.scale||1;_mobileDeceleration=options.mobileDeceleration||DEFAULT_MOBILE_DECELERATION;_smoothScrollingEnabled=options.smoothScrolling!==false;_smoothScrollingDuration=options.smoothScrollingDuration||DEFAULT_SMOOTH_SCROLLING_DURATION;_smoothScrolling={targetTop:_instance.getScrollTop()};_isMobile=(options.mobileCheck||function(){return/Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent||navigator.vendor||window.opera)})();if(_isMobile){_skrollrBody=document.getElementById("skrollr-body");if(_skrollrBody)_detect3DTransforms();_initMobile();_updateClass(documentElement,[SKROLLR_CLASS,SKROLLR_MOBILE_CLASS],[NO_SKROLLR_CLASS])}else _updateClass(documentElement,[SKROLLR_CLASS,SKROLLR_DESKTOP_CLASS],[NO_SKROLLR_CLASS]);_instance.refresh();_addEvent(window,"resize orientationchange",function(){var width=documentElement.clientWidth;var height=documentElement.clientHeight;if(height!==_lastViewportHeight||width!==_lastViewportWidth){_lastViewportHeight=height;_lastViewportWidth=width;_requestReflow=true}});var requestAnimFrame=polyfillRAF();(function animloop(){_render();_animFrame=requestAnimFrame(animloop)})();return _instance}Skrollr.prototype.refresh=function(elements){var elementIndex;var elementsLength;var ignoreID=false;if(elements===undefined){ignoreID=true;_skrollables=[];_skrollableIdCounter=0;elements=document.getElementsByTagName("*")}else elements=[].concat(elements);elementIndex=0;elementsLength=elements.length;for(;elementIndex<elementsLength;elementIndex++){var el=elements[elementIndex];var anchorTarget=el;var keyFrames=[];var smoothScrollThis=_smoothScrollingEnabled;var edgeStrategy=_edgeStrategy;if(!el.attributes)continue;var attributeIndex=0;var attributesLength=el.attributes.length;for(;attributeIndex<attributesLength;attributeIndex++){var attr=el.attributes[attributeIndex];if(attr.name==="data-anchor-target"){anchorTarget=document.querySelector(attr.value);if(anchorTarget===null)throw'Unable to find anchor target "'+attr.value+'"';continue}if(attr.name==="data-smooth-scrolling"){smoothScrollThis=attr.value!=="off";continue}if(attr.name==="data-edge-strategy"){edgeStrategy=attr.value;continue}var match=attr.name.match(rxKeyframeAttribute);if(match===null)continue;var kf={props:attr.value,element:el};keyFrames.push(kf);var constant=match[1];if(constant)kf.constant=constant.substr(1);var offset=match[2];if(/p$/.test(offset)){kf.isPercentage=true;kf.offset=(offset.slice(0,-1)|0)/100}else kf.offset=offset|0;var anchor1=match[3];var anchor2=match[4]||anchor1;if(!anchor1||anchor1===ANCHOR_START||anchor1===ANCHOR_END){kf.mode="absolute";if(anchor1===ANCHOR_END)kf.isEnd=true;else if(!kf.isPercentage)kf.offset=kf.offset*_scale}else{kf.mode="relative";kf.anchors=[anchor1,anchor2]}}if(!keyFrames.length)continue;var styleAttr,classAttr;var id;if(!ignoreID&&SKROLLABLE_ID_DOM_PROPERTY in el){id=el[SKROLLABLE_ID_DOM_PROPERTY];styleAttr=_skrollables[id].styleAttr;classAttr=_skrollables[id].classAttr}else{id=el[SKROLLABLE_ID_DOM_PROPERTY]=_skrollableIdCounter++;styleAttr=el.style.cssText;classAttr=_getClass(el)}_skrollables[id]={element:el,styleAttr:styleAttr,classAttr:classAttr,anchorTarget:anchorTarget,keyFrames:keyFrames,smoothScrolling:smoothScrollThis,edgeStrategy:edgeStrategy};_updateClass(el,[SKROLLABLE_CLASS],[])}_reflow();elementIndex=0;elementsLength=elements.length;for(;elementIndex<elementsLength;elementIndex++){var sk=_skrollables[elements[elementIndex][SKROLLABLE_ID_DOM_PROPERTY]];if(sk===undefined)continue;_parseProps(sk);_fillProps(sk)}return _instance};Skrollr.prototype.relativeToAbsolute=function(element,viewportAnchor,elementAnchor){var viewportHeight=documentElement.clientHeight;var box=element.getBoundingClientRect();var absolute=box.top;var boxHeight=box.bottom-box.top;if(viewportAnchor===ANCHOR_BOTTOM)absolute-=viewportHeight;else if(viewportAnchor===ANCHOR_CENTER)absolute-=viewportHeight/2;if(elementAnchor===ANCHOR_BOTTOM)absolute+=boxHeight;else if(elementAnchor===ANCHOR_CENTER)absolute+=boxHeight/2;absolute+=_instance.getScrollTop();return absolute+.5|0};Skrollr.prototype.animateTo=function(top,options){options=options||{};var now=_now();var scrollTop=_instance.getScrollTop();_scrollAnimation={startTop:scrollTop,topDiff:top-scrollTop,targetTop:top,duration:options.duration||DEFAULT_DURATION,startTime:now,endTime:now+(options.duration||DEFAULT_DURATION),easing:easings[options.easing||DEFAULT_EASING],done:options.done};if(!_scrollAnimation.topDiff){if(_scrollAnimation.done)_scrollAnimation.done.call(_instance,false);_scrollAnimation=undefined}return _instance};Skrollr.prototype.stopAnimateTo=function(){if(_scrollAnimation&&_scrollAnimation.done)_scrollAnimation.done.call(_instance,true);_scrollAnimation=undefined};Skrollr.prototype.isAnimatingTo=function(){return!!_scrollAnimation};Skrollr.prototype.setScrollTop=function(top,force){_forceRender=force===true;if(_isMobile)_mobileOffset=Math.min(Math.max(top,0),_maxKeyFrame);else window.scrollTo(0,top);return _instance};Skrollr.prototype.getScrollTop=function(){if(_isMobile)return _mobileOffset;else return window.pageYOffset||documentElement.scrollTop||body.scrollTop||0};Skrollr.prototype.getMaxScrollTop=function(){return _maxKeyFrame};Skrollr.prototype.on=function(name,fn){_listeners[name]=fn;return _instance};Skrollr.prototype.off=function(name){delete _listeners[name];return _instance};Skrollr.prototype.destroy=function(){var cancelAnimFrame=polyfillCAF();cancelAnimFrame(_animFrame);_removeAllEvents();_updateClass(documentElement,[NO_SKROLLR_CLASS],[SKROLLR_CLASS,SKROLLR_DESKTOP_CLASS,SKROLLR_MOBILE_CLASS]);var skrollableIndex=0;var skrollablesLength=_skrollables.length;for(;skrollableIndex<skrollablesLength;skrollableIndex++)_reset(_skrollables[skrollableIndex].element);documentElement.style.overflow=body.style.overflow="auto";documentElement.style.height=body.style.height="auto";if(_skrollrBody)skrollr.setStyle(_skrollrBody,"transform","none");_instance=undefined;_skrollrBody=undefined;_listeners=undefined;_forceHeight=undefined;_maxKeyFrame=0;_scale=1;_constants=undefined;_mobileDeceleration=undefined;_direction="down";_lastTop=-1;_lastViewportWidth=0;_lastViewportHeight=0;_requestReflow=false;_scrollAnimation=undefined;_smoothScrollingEnabled=undefined;_smoothScrollingDuration=undefined;_smoothScrolling=undefined;_forceRender=undefined;_skrollableIdCounter=0;_edgeStrategy=undefined;_isMobile=false;_mobileOffset=0;_translateZ=undefined};var _initMobile=function(){var initialElement;var initialTouchY;var initialTouchX;var currentElement;var currentTouchY;var currentTouchX;var lastTouchY;var deltaY;var initialTouchTime;var currentTouchTime;var lastTouchTime;var deltaTime;_addEvent(documentElement,[EVENT_TOUCHSTART,EVENT_TOUCHMOVE,EVENT_TOUCHCANCEL,EVENT_TOUCHEND].join(" "),function(e){var touch=e.changedTouches[0];currentElement=e.target;while(currentElement.nodeType===3)currentElement=currentElement.parentNode;currentTouchY=touch.clientY;currentTouchX=touch.clientX;currentTouchTime=e.timeStamp;if(!rxTouchIgnoreTags.test(currentElement.tagName))e.preventDefault();switch(e.type){case EVENT_TOUCHSTART:if(initialElement)initialElement.blur();_instance.stopAnimateTo();initialElement=currentElement;initialTouchY=lastTouchY=currentTouchY;initialTouchX=currentTouchX;initialTouchTime=currentTouchTime;break;case EVENT_TOUCHMOVE:if(rxTouchIgnoreTags.test(currentElement.tagName)&&document.activeElement!==currentElement)e.preventDefault();deltaY=currentTouchY-lastTouchY;deltaTime=currentTouchTime-lastTouchTime;_instance.setScrollTop(_mobileOffset-deltaY,true);lastTouchY=currentTouchY;lastTouchTime=currentTouchTime;break;default:case EVENT_TOUCHCANCEL:case EVENT_TOUCHEND:var distanceY=initialTouchY-currentTouchY;var distanceX=initialTouchX-currentTouchX;var distance2=distanceX*distanceX+distanceY*distanceY;if(distance2<49){if(!rxTouchIgnoreTags.test(initialElement.tagName)){initialElement.focus();var clickEvent=document.createEvent("MouseEvents");clickEvent.initMouseEvent("click",true,true,e.view,1,touch.screenX,touch.screenY,touch.clientX,touch.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,0,null);initialElement.dispatchEvent(clickEvent)}return}initialElement=undefined;var speed=deltaY/deltaTime;speed=Math.max(Math.min(speed,3),-3);var duration=Math.abs(speed/_mobileDeceleration);var targetOffset=speed*duration+.5*_mobileDeceleration*duration*duration;var targetTop=_instance.getScrollTop()-targetOffset;var targetRatio=0;if(targetTop>_maxKeyFrame){targetRatio=(_maxKeyFrame-targetTop)/targetOffset;targetTop=_maxKeyFrame}else if(targetTop<0){targetRatio=-targetTop/targetOffset;targetTop=0}duration=duration*(1-targetRatio);_instance.animateTo(targetTop+.5|0,{easing:"outCubic",duration:duration});break}});window.scrollTo(0,0);documentElement.style.overflow=body.style.overflow="hidden"};var _updateDependentKeyFrames=function(){var viewportHeight=documentElement.clientHeight;var processedConstants=_processConstants();var skrollable;var element;var anchorTarget;var keyFrames;var keyFrameIndex;var keyFramesLength;var kf;var skrollableIndex;var skrollablesLength;var offset;var constantValue;skrollableIndex=0;skrollablesLength=_skrollables.length;for(;skrollableIndex<skrollablesLength;skrollableIndex++){skrollable=_skrollables[skrollableIndex];element=skrollable.element;anchorTarget=skrollable.anchorTarget;keyFrames=skrollable.keyFrames;keyFrameIndex=0;keyFramesLength=keyFrames.length;for(;keyFrameIndex<keyFramesLength;keyFrameIndex++){kf=keyFrames[keyFrameIndex];offset=kf.offset;constantValue=processedConstants[kf.constant]||0;kf.frame=offset;if(kf.isPercentage){offset=offset*viewportHeight;kf.frame=offset}if(kf.mode==="relative"){_reset(element);kf.frame=_instance.relativeToAbsolute(anchorTarget,kf.anchors[0],kf.anchors[1])-offset;_reset(element,true)}kf.frame+=constantValue;if(_forceHeight)if(!kf.isEnd&&kf.frame>_maxKeyFrame)_maxKeyFrame=kf.frame}}_maxKeyFrame=Math.max(_maxKeyFrame,_getDocumentHeight());skrollableIndex=0;skrollablesLength=_skrollables.length;for(;skrollableIndex<skrollablesLength;skrollableIndex++){skrollable=_skrollables[skrollableIndex];keyFrames=skrollable.keyFrames;keyFrameIndex=0;keyFramesLength=keyFrames.length;for(;keyFrameIndex<keyFramesLength;keyFrameIndex++){kf=keyFrames[keyFrameIndex];constantValue=processedConstants[kf.constant]||0;if(kf.isEnd)kf.frame=_maxKeyFrame-kf.offset+constantValue}skrollable.keyFrames.sort(_keyFrameComparator)}};var _calcSteps=function(fakeFrame,actualFrame){var skrollableIndex=0;var skrollablesLength=_skrollables.length;for(;skrollableIndex<skrollablesLength;skrollableIndex++){var skrollable=_skrollables[skrollableIndex];var element=skrollable.element;var frame=skrollable.smoothScrolling?fakeFrame:actualFrame;var frames=skrollable.keyFrames;var firstFrame=frames[0].frame;var lastFrame=frames[frames.length-1].frame;var beforeFirst=frame<firstFrame;var afterLast=frame>lastFrame;var firstOrLastFrame=frames[beforeFirst?0:frames.length-1];var key;var value;if(beforeFirst||afterLast){if(beforeFirst&&skrollable.edge===-1||afterLast&&skrollable.edge===1)continue;_updateClass(element,[beforeFirst?SKROLLABLE_BEFORE_CLASS:SKROLLABLE_AFTER_CLASS],[SKROLLABLE_BEFORE_CLASS,SKROLLABLE_BETWEEN_CLASS,SKROLLABLE_AFTER_CLASS]);skrollable.edge=beforeFirst?-1:1;switch(skrollable.edgeStrategy){case "reset":_reset(element);continue;case "ease":frame=firstOrLastFrame.frame;break;default:case "set":var props=firstOrLastFrame.props;for(key in props)if(hasProp.call(props,key)){value=_interpolateString(props[key].value);skrollr.setStyle(element,key,value)}continue}}else if(skrollable.edge!==0){_updateClass(element,[SKROLLABLE_CLASS,SKROLLABLE_BETWEEN_CLASS],[SKROLLABLE_BEFORE_CLASS,SKROLLABLE_AFTER_CLASS]);skrollable.edge=0}var keyFrameIndex=0;var framesLength=frames.length-1;for(;keyFrameIndex<framesLength;keyFrameIndex++)if(frame>=frames[keyFrameIndex].frame&&frame<=frames[keyFrameIndex+1].frame){var left=frames[keyFrameIndex];var right=frames[keyFrameIndex+1];for(key in left.props)if(hasProp.call(left.props,key)){var progress=(frame-left.frame)/(right.frame-left.frame);progress=left.props[key].easing(progress);value=_calcInterpolation(left.props[key].value,right.props[key].value,progress);value=_interpolateString(value);skrollr.setStyle(element,key,value)}break}}};var _render=function(){if(_requestReflow){_requestReflow=false;_reflow()}var renderTop=_instance.getScrollTop();var afterAnimationCallback;var now=_now();var progress;if(_scrollAnimation){if(now>=_scrollAnimation.endTime){renderTop=_scrollAnimation.targetTop;afterAnimationCallback=_scrollAnimation.done;_scrollAnimation=undefined}else{progress=_scrollAnimation.easing((now-_scrollAnimation.startTime)/_scrollAnimation.duration);renderTop=_scrollAnimation.startTop+progress*_scrollAnimation.topDiff|0}_instance.setScrollTop(renderTop,true)}else if(!_forceRender){var smoothScrollingDiff=_smoothScrolling.targetTop-renderTop;if(smoothScrollingDiff)_smoothScrolling={startTop:_lastTop,topDiff:renderTop-_lastTop,targetTop:renderTop,startTime:_lastRenderCall,endTime:_lastRenderCall+_smoothScrollingDuration};if(now<=_smoothScrolling.endTime){progress=easings.sqrt((now-_smoothScrolling.startTime)/_smoothScrollingDuration);renderTop=_smoothScrolling.startTop+progress*_smoothScrolling.topDiff|0}}if(_isMobile&&_skrollrBody)skrollr.setStyle(_skrollrBody,"transform","translate(0, "+-_mobileOffset+"px) "+_translateZ);if(_forceRender||_lastTop!==renderTop){_direction=renderTop>_lastTop?"down":renderTop<_lastTop?"up":_direction;_forceRender=false;var listenerParams={curTop:renderTop,astTop:_lastTop,maxTop:_maxKeyFrame,direction:_direction};var continueRendering=_listeners.beforerender&&_listeners.beforerender.call(_instance,listenerParams);if(continueRendering!==false){_calcSteps(renderTop,_instance.getScrollTop());_lastTop=renderTop;if(_listeners.render)_listeners.render.call(_instance,listenerParams)}if(afterAnimationCallback)afterAnimationCallback.call(_instance,false)}_lastRenderCall=now};var _parseProps=function(skrollable){var keyFrameIndex=0;var keyFramesLength=skrollable.keyFrames.length;for(;keyFrameIndex<keyFramesLength;keyFrameIndex++){var frame=skrollable.keyFrames[keyFrameIndex];var easing;var value;var prop;var props={};var match;while((match=rxPropValue.exec(frame.props))!==null){prop=match[1];value=match[2];easing=prop.match(rxPropEasing);if(easing!==null){prop=easing[1];easing=easing[2]}else easing=DEFAULT_EASING;value=value.indexOf("!")?_parseProp(value):[value.slice(1)];props[prop]={value:value,easing:easings[easing]}}frame.props=props}};var _parseProp=function(val){var numbers=[];rxRGBAIntegerColor.lastIndex=0;val=val.replace(rxRGBAIntegerColor,function(rgba){return rgba.replace(rxNumericValue,function(n){return n/255*100+"%"})});if(theDashedCSSPrefix){rxGradient.lastIndex=0;val=val.replace(rxGradient,function(s){return theDashedCSSPrefix+s})}val=val.replace(rxNumericValue,function(n){numbers.push(+n);return"{?}"});numbers.unshift(val);return numbers};var _fillProps=function(sk){var propList={};var keyFrameIndex;var keyFramesLength;keyFrameIndex=0;keyFramesLength=sk.keyFrames.length;for(;keyFrameIndex<keyFramesLength;keyFrameIndex++)_fillPropForFrame(sk.keyFrames[keyFrameIndex],propList);propList={};keyFrameIndex=sk.keyFrames.length-1;for(;keyFrameIndex>=0;keyFrameIndex--)_fillPropForFrame(sk.keyFrames[keyFrameIndex],propList)};var _fillPropForFrame=function(frame,propList){var key;for(key in propList)if(!hasProp.call(frame.props,key))frame.props[key]=propList[key];for(key in frame.props)propList[key]=frame.props[key]};var _calcInterpolation=function(val1,val2,progress){var valueIndex;var val1Length=val1.length;if(val1Length!==val2.length)throw"Can't interpolate between \""+val1[0]+'" and "'+val2[0]+'"';var interpolated=[val1[0]];valueIndex=1;for(;valueIndex<val1Length;valueIndex++)interpolated[valueIndex]=val1[valueIndex]+(val2[valueIndex]-val1[valueIndex])*progress;return interpolated};var _interpolateString=function(val){var valueIndex=1;rxInterpolateString.lastIndex=0;return val[0].replace(rxInterpolateString,function(){return val[valueIndex++]})};var _reset=function(elements,undo){elements=[].concat(elements);var skrollable;var element;var elementsIndex=0;var elementsLength=elements.length;for(;elementsIndex<elementsLength;elementsIndex++){element=elements[elementsIndex];skrollable=_skrollables[element[SKROLLABLE_ID_DOM_PROPERTY]];if(!skrollable)continue;if(undo){element.style.cssText=skrollable.dirtyStyleAttr;_updateClass(element,skrollable.dirtyClassAttr)}else{skrollable.dirtyStyleAttr=element.style.cssText;skrollable.dirtyClassAttr=_getClass(element);element.style.cssText=skrollable.styleAttr;_updateClass(element,skrollable.classAttr)}}};var _detect3DTransforms=function(){_translateZ="translateZ(0)";skrollr.setStyle(_skrollrBody,"transform",_translateZ);var computedStyle=getStyle(_skrollrBody);var computedTransform=computedStyle.getPropertyValue("transform");var computedTransformWithPrefix=computedStyle.getPropertyValue(theDashedCSSPrefix+"transform");var has3D=computedTransform&&computedTransform!=="none"||computedTransformWithPrefix&&computedTransformWithPrefix!=="none";if(!has3D)_translateZ=""};skrollr.setStyle=function(el,prop,val){var style=el.style;prop=prop.replace(rxCamelCase,rxCamelCaseFn).replace("-","");if(prop==="zIndex")if(isNaN(val))style[prop]=val;else style[prop]=""+(val|0);else if(prop==="float")style.styleFloat=style.cssFloat=val;else try{if(theCSSPrefix)style[theCSSPrefix+prop.slice(0,1).toUpperCase()+prop.slice(1)]=val;style[prop]=val}catch(ignore){}};var _addEvent=skrollr.addEvent=function(element,names,callback){var intermediate=function(e){e=e||window.event;if(!e.target)e.target=e.srcElement;if(!e.preventDefault)e.preventDefault=function(){e.returnValue=false};return callback.call(this,e)};names=names.split(" ");var name;var nameCounter=0;var namesLength=names.length;for(;nameCounter<namesLength;nameCounter++){name=names[nameCounter];if(element.addEventListener)element.addEventListener(name,callback,false);else element.attachEvent("on"+name,intermediate);_registeredEvents.push({element:element,name:name,listener:callback})}};var _removeEvent=skrollr.removeEvent=function(element,names,callback){names=names.split(" ");var nameCounter=0;var namesLength=names.length;for(;nameCounter<namesLength;nameCounter++)if(element.removeEventListener)element.removeEventListener(names[nameCounter],callback,false);else element.detachEvent("on"+names[nameCounter],callback)};var _removeAllEvents=function(){var eventData;var eventCounter=0;var eventsLength=_registeredEvents.length;for(;eventCounter<eventsLength;eventCounter++){eventData=_registeredEvents[eventCounter];_removeEvent(eventData.element,eventData.name,eventData.listener)}_registeredEvents=[]};var _reflow=function(){var pos=_instance.getScrollTop();_maxKeyFrame=0;if(_forceHeight&&!_isMobile)body.style.height="auto";_updateDependentKeyFrames();if(_forceHeight&&!_isMobile)body.style.height=_maxKeyFrame+documentElement.clientHeight+"px";if(_isMobile)_instance.setScrollTop(Math.min(_instance.getScrollTop(),_maxKeyFrame));else _instance.setScrollTop(pos,true);_forceRender=true};var _processConstants=function(){var viewportHeight=documentElement.clientHeight;var copy={};var prop;var value;for(prop in _constants){value=_constants[prop];if(typeof value==="function")value=value.call(_instance);else if(/p$/.test(value))value=value.slice(0,-1)/100*viewportHeight;copy[prop]=value}return copy};var _getDocumentHeight=function(){var skrollrBodyHeight=_skrollrBody&&_skrollrBody.offsetHeight||0;var bodyHeight=Math.max(skrollrBodyHeight,body.scrollHeight,body.offsetHeight,documentElement.scrollHeight,documentElement.offsetHeight,documentElement.clientHeight);return bodyHeight-documentElement.clientHeight};var _getClass=function(element){var prop="className";if(window.SVGElement&&element instanceof window.SVGElement){element=element[prop];prop="baseVal"}return element[prop]};var _updateClass=function(element,add,remove){var prop="className";if(window.SVGElement&&element instanceof window.SVGElement){element=element[prop];prop="baseVal"}if(remove===undefined){element[prop]=add;return}var val=element[prop];var classRemoveIndex=0;var removeLength=remove.length;for(;classRemoveIndex<removeLength;classRemoveIndex++)val=_untrim(val).replace(_untrim(remove[classRemoveIndex])," ");val=_trim(val);var classAddIndex=0;var addLength=add.length;for(;classAddIndex<addLength;classAddIndex++)if(_untrim(val).indexOf(_untrim(add[classAddIndex]))===-1)val+=" "+add[classAddIndex];element[prop]=_trim(val)};var _trim=function(a){return a.replace(rxTrim,"")};var _untrim=function(a){return" "+a+" "};var _now=Date.now||function(){return+new Date};var _keyFrameComparator=function(a,b){return a.frame-b.frame};var _instance;var _skrollables;var _skrollrBody;var _listeners;var _forceHeight;var _maxKeyFrame=0;var _scale=1;var _constants;var _mobileDeceleration;var _direction="down";var _lastTop=-1;var _lastRenderCall=_now();var _lastViewportWidth=0;var _lastViewportHeight=0;var _requestReflow=false;var _scrollAnimation;var _smoothScrollingEnabled;var _smoothScrollingDuration;var _smoothScrolling;var _forceRender;var _skrollableIdCounter=0;var _edgeStrategy;var _isMobile=false;var _mobileOffset=0;var _translateZ;var _registeredEvents=[];var _animFrame})(window,document);
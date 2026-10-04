const orderDialog=document.getElementById('order-dialog');
const legalDialog=document.getElementById('legal-dialog');
let returnFocus=null;
function openDialog(dialog){returnFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');}
function closeDialog(dialog){dialog.close();}
document.querySelectorAll('[data-order]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.model){document.getElementById('collar-model').value=button.dataset.model;updateOrder();}openDialog(orderDialog);}));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close]').addEventListener('click',()=>closeDialog(dialog));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');returnFocus?.focus();});});
const quantity=document.getElementById('quantity');const province=document.getElementById('province');
function updateOrder(){
 const count=Math.min(9999,Math.max(1,parseInt(quantity.value,10)||1));quantity.value=count;
 const model=document.getElementById('collar-model').value;const withAntenna=model==='antenna';
 const antennaInput=document.getElementById('antenna-quantity');const antennas=withAntenna?Math.min(999,Math.max(0,parseInt(antennaInput.value,10)||0)):0;
 antennaInput.value=withAntenna?antennas:antennaInput.value;document.getElementById('antenna-options').hidden=!withAntenna;
 document.getElementById('minus').disabled=count===1;document.getElementById('plus').disabled=count===9999;
 const total=count*(withAntenna?110:100)+antennas*800;
 const formatted=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(total);
 document.getElementById('estimated-total').textContent=formatted+' aprox.';
 const money=value=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
 const lines=[`${count} ${count===1?'collar':'collares'} ${withAntenna?'con antena':'5G'} × ${money(withAntenna?110:100)} = ${money(count*(withAntenna?110:100))}`];
 if(withAntenna)lines.push(`${antennas} ${antennas===1?'antena':'antenas'} × ${money(800)} = ${money(antennas*800)}`);
 document.getElementById('estimate-breakdown').replaceChildren(...lines.map(text=>{const line=document.createElement('p');line.textContent=text;return line;}));
 document.getElementById('selected-model-name').textContent=withAntenna?'Para vacas · Con antena':'Para vacas · 5G';
 const region=province.value.trim();
 const message=`Hola, me interesan ${count} ${count===1?'collar':'collares'} ULLAN GPS ${withAntenna?'con antena':'5G'} para vacas${withAntenna?' y '+antennas+' '+(antennas===1?'antena':'antenas'):''}${region?' para una finca en '+region:''}. La estimación orientativa de equipos es ${formatted}. Quiero confirmar disponibilidad, configuración, impuestos, envío, instalación y posibles cuotas antes de comprar.`;
 document.getElementById('order-whatsapp').href='https://wa.me/34603682555?text='+encodeURIComponent(message);
}
document.getElementById('collar-model').addEventListener('change',updateOrder);
document.getElementById('antenna-quantity').addEventListener('change',updateOrder);
document.getElementById('minus').addEventListener('click',()=>{quantity.value=Number(quantity.value)-1;updateOrder();});document.getElementById('plus').addEventListener('click',()=>{quantity.value=Number(quantity.value)+1;updateOrder();});quantity.addEventListener('change',updateOrder);province.addEventListener('input',updateOrder);document.getElementById('order-whatsapp').addEventListener('click',updateOrder);updateOrder();
const policy={legal:{title:'Aviso legal',paragraphs:['ULLAN GPS es un proyecto de collares localizadores para ganado bovino. Contacto: +34 603 682 555.','Esta versión presenta un concepto de marca y acabado de producto. La contratación y el pago online todavía no están habilitados. Las consultas por WhatsApp no constituyen una compra.','Antes de iniciar la venta se publicarán los datos del titular de la actividad, identificación fiscal, domicilio y contacto, junto con precios, impuestos, envíos, garantías, devoluciones y condiciones de contratación.','Las características técnicas se basan en la ficha Cguard+ proporcionada para este proyecto. La configuración y el acabado final requieren confirmación.']},privacy:{title:'Privacidad',paragraphs:['Esta página no dispone de cuentas de usuario, formularios enviados a un servidor ni analítica de visitantes instalada por ULLAN GPS.','El modelo, las cantidades de collares y antenas y la provincia introducidos en la consulta se procesan en tu navegador. No se guardan en esta página. Al pulsar el botón de consulta, se incorporan al enlace que abre WhatsApp.','WhatsApp es un servicio externo sujeto a sus propias condiciones y política de privacidad. El alojamiento del sitio puede procesar datos técnicos necesarios para servir la página.','Las tipografías y las imágenes se sirven desde este sitio. Antes del lanzamiento comercial se completará la información del responsable y el tratamiento de consultas y pedidos.']},cookies:{title:'Cookies',paragraphs:['Esta versión no instala cookies de analítica o publicidad por parte de ULLAN GPS, y solo recuerda localmente que has cerrado el aviso de privacidad.','Los servicios de alojamiento o acceso a esta vista pueden utilizar mecanismos técnicos propios. WhatsApp tiene sus propias condiciones cuando abres su enlace.','Si se incorporan herramientas de medición o publicidad, se informará de ellas y se habilitará la gestión del consentimiento antes de activarlas.']}};
document.querySelectorAll('[data-legal]').forEach(button=>button.addEventListener('click',()=>{const content=policy[button.dataset.legal];document.getElementById('legal-title').textContent=content.title;document.getElementById('legal-content').replaceChildren(...content.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));openDialog(legalDialog);}));
document.getElementById('year').textContent=new Date().getFullYear();

const notice=document.getElementById('cookie-notice');
const privacyKey='ULLAN-privacy-notice-v1';
try{if(localStorage.getItem('ullan-privacy-notice-v1')&&!localStorage.getItem(privacyKey)){localStorage.setItem(privacyKey,localStorage.getItem('ullan-privacy-notice-v1'));localStorage.removeItem('ullan-privacy-notice-v1');}}catch{}
function hasDismissed(){try{return localStorage.getItem(privacyKey)==='dismissed';}catch{return false;}}
notice.hidden=hasDismissed();
document.getElementById('cookie-dismiss').addEventListener('click',()=>{notice.hidden=true;try{localStorage.setItem(privacyKey,'dismissed');}catch{}});
// The product story stays in normal document flow at every viewport size.
const heroCollar=document.getElementById('hero-collar');
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
let frameQueued=false;
function updateVisuals(){
 frameQueued=false;
 const progress=motionPreference.matches?0:clamp(window.scrollY/Math.max(600,window.innerHeight),0,1);
 heroCollar.style.setProperty('--hero-y',`${progress*(window.innerWidth<=760?18:60)}px`);
 heroCollar.style.setProperty('--hero-angle',`${-8+progress*15}deg`);
 heroCollar.style.setProperty('--hero-scale',String(1+progress*.055));
}
function queueVisuals(){if(!frameQueued){frameQueued=true;requestAnimationFrame(updateVisuals);}}
window.addEventListener('scroll',queueVisuals,{passive:true});
window.addEventListener('resize',queueVisuals);
motionPreference.addEventListener('change',queueVisuals);
if('IntersectionObserver' in window){
 const storyObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{entry.target.classList.toggle('story-in-view',entry.isIntersecting);});},{threshold:.15});
 document.querySelectorAll('.story-visual').forEach(visual=>storyObserver.observe(visual));
}
const partButtons=[...document.querySelectorAll('[data-part]')];
function selectPart(index,focus=false){partButtons.forEach((button,i)=>{const selected=i===index;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;document.getElementById(button.getAttribute('aria-controls')).hidden=!selected;});const transforms=['scale(1.04) rotate(-4deg)','scale(1.18) translate(1%,3%) rotate(3deg)','scale(.95) translate(-3%,2%) rotate(10deg)'];document.getElementById('anatomy-product').style.setProperty('--anatomy-transform',transforms[index]);document.querySelector('.anatomy-index').textContent=`0${index+1}`;if(focus)partButtons[index].focus();}
partButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectPart(index));button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%partButtons.length;else if(event.key==='ArrowLeft')next=(index+partButtons.length-1)%partButtons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=partButtons.length-1;else return;event.preventDefault();selectPart(next,true);});});
updateVisuals();

const fenceSteps=[
 {kicker:'EL LÍMITE SE DEFINE EN EL SISTEMA',title:'Una zona de referencia.',description:'El vallado virtual utiliza una zona definida en el sistema compatible. El procedimiento exacto de configuración y la plataforma se confirmarán para la versión final del collar.',status:'Primero: definir la zona',x:210,y:245},
 {kicker:'LA POSICIÓN DEL COLLAR ES LA REFERENCIA',title:'El GPS sitúa al animal.',description:'El receptor calcula la posición del collar. Esa posición sirve como referencia respecto al límite configurado. La precisión y el funcionamiento dependen del entorno y del equipo.',status:'Después: relacionar posición y límite',x:350,y:235},
 {kicker:'SEÑALES SEGÚN LA CONFIGURACIÓN',title:'Avisar y supervisar.',description:'El equipo de referencia admite una señal acústica y estímulos eléctricos ajustables para el vallado virtual. Los umbrales, la secuencia y el protocolo de adaptación deben seguir las instrucciones del fabricante.',status:'Señales ajustables · supervisión necesaria',x:419,y:208}
];
const fenceButtons=[...document.querySelectorAll('[data-fence]')];
fenceButtons.forEach((button,index)=>button.addEventListener('click',()=>{const step=fenceSteps[index];document.getElementById('fence-kicker').textContent=step.kicker;document.getElementById('fence-title').textContent=step.title;document.getElementById('fence-description').textContent=step.description;document.getElementById('fence-status').textContent=step.status;document.getElementById('fence-step-count').textContent=`0${index+1} / 03`;document.getElementById('fence-marker').style.transform=`translate(${step.x}px,${step.y}px)`;document.querySelector('.fence-visual').classList.toggle('is-near',index===2);fenceButtons.forEach((tab,i)=>{tab.classList.toggle('active',i===index);tab.setAttribute('aria-pressed',String(i===index));});}));

const menuToggle=document.querySelector('.menu-toggle');const siteNav=document.getElementById('site-nav');
function closeMenu(){menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menú de navegación');siteNav.classList.remove('is-open');}
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Cerrar menú de navegación':'Abrir menú de navegación');siteNav.classList.toggle('is-open',open);});
siteNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){closeMenu();menuToggle.focus();}});
document.addEventListener('click',event=>{if(!siteNav.contains(event.target)&&!menuToggle.contains(event.target))closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu();});

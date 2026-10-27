const saved=sessionStorage.getItem('carto-print-document');sessionStorage.removeItem('carto-print-document');
const target=document.querySelector('#print-document');
if(saved){const data=JSON.parse(saved);document.title=data.title||'Rapport · Carto-CNS';target.innerHTML=data.html;for(const el of target.querySelectorAll('script,dialog,iframe,object,embed'))el.remove()}else target.innerHTML='<h1>Aucun rapport préparé</h1><p>Revenez dans l’application et utilisez le bouton Imprimer du rapport souhaité.</p>';
document.querySelector('#print-launch').addEventListener('click',()=>window.print());document.querySelector('#print-back').addEventListener('click',()=>history.length>1?history.back():location.assign('/'));

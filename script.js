const categories=[['👗','Fashion','2.4K+','fashion'],['📱','Electronics','1.8K+','electronics'],['💄','Beauty','1.2K+','beauty'],['🏠','Home & Living','1.5K+','home'],['👟','Shoes','980+','shoes'],['👜','Bags','760+','bags'],['💎','Jewellery','640+','jewellery'],['🎧','Mobile & Accessories','1.1K+','mobile'],['🛒','Grocery','2K+','grocery'],['⚽','Sports','540+','sports']];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=$('#toast');
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function renderCategories(){const grid=$('#categoryGrid');if(!grid)return;grid.innerHTML=categories.map(c=>`<button class="category" type="button" data-cat="${escapeHtml(c[3])}"><div class="emoji">${c[0]}</div><b>${escapeHtml(c[1])}</b><small>${c[2]} items</small></button>`).join('');$$('.category').forEach(x=>x.onclick=()=>{ $$('.filter').forEach(f=>f.classList.toggle('active',f.dataset.filter===x.dataset.cat));$('#categorySelect')&&($('#categorySelect').value=x.dataset.cat); window.filterProducts?.(x.dataset.cat,$('#searchInput')?.value||'');scrollToId('products');});}
function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>toast.classList.remove('show'),2200)}
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
window.scrollToId=scrollToId;window.showToast=showToast;window.escapeHtml=escapeHtml;
$('#categorySelect')?.addEventListener('change',e=>{window.filterProducts?.(e.target.value,$('#searchInput')?.value||'');scrollToId('products')});
$('#searchForm')?.addEventListener('submit',e=>{e.preventDefault();window.filterProducts?.('all',$('#searchInput')?.value||'');scrollToId('products');});
$('#catMenu')?.addEventListener('click',()=>scrollToId('categories'));
$('#newsletter')?.addEventListener('submit',e=>{e.preventDefault();showToast('Thanks! You are subscribed ✓');e.target.reset();});
const modal=$('#modal');$('#closeModal')?.addEventListener('click',()=>modal?.classList.remove('show'));modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});$('#modalAction')?.addEventListener('click',()=>modal?.classList.remove('show'));
let seconds=8*3600+45*60+22;setInterval(()=>{seconds=Math.max(0,seconds-1);const h=String(Math.floor(seconds/3600)).padStart(2,'0'),m=String(Math.floor(seconds%3600/60)).padStart(2,'0'),s=String(seconds%60).padStart(2,'0');if($('#countdown'))$('#countdown').textContent=`${h}:${m}:${s}`;},1000);
renderCategories();

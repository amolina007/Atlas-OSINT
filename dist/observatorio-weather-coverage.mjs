// Geographic rectangles use unwrapped longitude, matching Leaflet's visible world.
export function uncoveredWeatherBounds(view,covered){
 if(!covered)return [view];
 const shift=360*Math.round(((view.west+view.east)-(covered.west+covered.east))/720);
 const c={...covered,west:covered.west+shift,east:covered.east+shift};
 const south=Math.max(view.south,c.south),north=Math.min(view.north,c.north),west=Math.max(view.west,c.west),east=Math.min(view.east,c.east);
 if(south>=north||west>=east)return [view];
 return [{south:north,north:view.north,west:view.west,east:view.east},{south:view.south,north:south,west:view.west,east:view.east},{south,north,west:view.west,east:west},{south,north,west:east,east:view.east}].filter(r=>r.north-r.south>0.00002&&r.east-r.west>0.00002);
}
export function bufferedWeatherBounds(view){
 const cy=(view.south+view.north)/2,cx=(view.west+view.east)/2,dy=(view.north-view.south)*.9,dx=Math.min(180,(view.east-view.west)*.9);
 return {south:Math.max(-85,cy-dy),north:Math.min(85,cy+dy),west:cx-dx,east:cx+dx};
}

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import JulianDate from 'julian-date';


const planets = [
  { index: 1, name: "Mercury", jname: "水星", size: 2439, radius: 57910000, period: 87.969, color: 0x9090a0, 
    eccentricity: 0.20563069, semiMajorAxis: 57909100, argumentOfPeriapsis: 29.124, satellites: [] },
  { index: 2, name: "Venus", jname: "金星", size: 6051, radius: 108208930, period: 224.701, color: 0xf0c000, 
    eccentricity: 0.00677323, semiMajorAxis: 108208930, argumentOfPeriapsis: 54.884, satellites: [] },
  { index: 3, name: "Earth", jname: "地球", size: 6356, radius: 149600000, period: 365.2564, color: 0x1090FF, 
    eccentricity: 0.01671022, semiMajorAxis: 149598023, argumentOfPeriapsis: 114.20783, satellites: [
    { index: 1, name: "Moon", jname: "月", size: 1737, radius: 384400, period: 27.32, color: 0xffff00,
      eccentricity: 0.0549, semiMajorAxis: 384400, argumentOfPeriapsis: 0 }
  ]},
  { index: 4, name: "Mars", jname: "火星", size: 3396, radius: 227920000, period: 686.980, color: 0xff8030, 
    eccentricity: 0.09341233, semiMajorAxis: 227939100, argumentOfPeriapsis: 286.462, satellites: [] },
  { index: 5, name: "Jupiter", jname: "木星", size: 69000, radius: 778412010, period: 4332.59, color: 0xffd080, 
    eccentricity: 0.04839266, semiMajorAxis: 778412020, argumentOfPeriapsis: 273.867, satellites: [] },
  { index: 6, name: "Saturn", jname: "土星", size: 58232, radius: 953707032, period: 10759.22, color: 0xfff0a0, 
    eccentricity: 0.05415060, semiMajorAxis: 1426725400, argumentOfPeriapsis: 339.392, satellites: [] },
  { index: 7, name: "Uranus", jname: "天王星", size: 25559, radius: 1919126393, period: 30688.5, color: 0x00f0ff, 
    eccentricity: 0.04716771, semiMajorAxis: 2870972200, argumentOfPeriapsis: 96.998857, satellites: [] },
  { index: 8, name: "Neptune", jname: "海王星", size: 24622, radius: 4514953000, period: 60182.0, color: 0xffff00, 
    eccentricity: 0.00858587, semiMajorAxis: 4498252900, argumentOfPeriapsis: 276.336, satellites: [] },
  { index: 9, name: "Pluto", jname: "冥王星", size: 1188, radius: 5906376272, period: 90560.0, color: 0x8B7355, 
    eccentricity: 0.2488, semiMajorAxis: 5906376272, argumentOfPeriapsis: 113.76329, satellites: [] },
  { index: 10, name: "Halley", jname: "ハレー彗星", size: 5, radius: 2662000000, period: 27500.0, color: 0xFFFFFF, 
    eccentricity: 0.967, semiMajorAxis: 2662000000, argumentOfPeriapsis: 111.33, isRetrograde: true, satellites: [] },
];

// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight;

// WebGLレンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#myCanvas"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

// ラベルレンダラー
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 9000);
camera.position.set(100, 150, 500);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// カメラコントローラー
const orbitControls = new OrbitControls(camera, labelRenderer.domElement);
orbitControls.enableDamping = true;

// グリッド
const grid = new THREE.GridHelper(600);
scene.add(grid);

// 軸
const axis = new THREE.AxesHelper(300);
scene.add(axis);


var julian = new JulianDate();
// var julian = new JulianDate("1018-11-26 21:00 UTC+09:00");
console.log(julian.getDate());
console.log(julian.julian());

// 日時表示用のDateオブジェクト
const date = julian.getDate();

for (var planet of planets) {
  planet.r = planet.radius * 0.0000004;
  // planet.r = planet.index * 32 + planet.radius * 0.00000003; // デフォルメ半径
  planet.size = planet.size * 0.0002;
  // planet.size = 8 + planet.size * 0.00012; // デフォルメサイズ
  const geometry = new THREE.SphereGeometry(planet.size, 32, 16);
  const material = new THREE.MeshStandardMaterial({color: planet.color});
  const mesh = new THREE.Mesh(geometry, material);
  planet.mesh = mesh;
  scene.add(mesh);

  // ラベル
  const div = document.createElement( 'div' );
  div.className = 'label';
  div.textContent = planet.jname;
  div.style.backgroundColor = 'transparent';

  const label = new CSS2DObject( div );
  label.position.set(0, -planet.size * 1.1, 0);
  label.center.set(0, 0);
  mesh.add( label );

  // 軌跡（楕円）
  orbitEllipse(planet);

  // 衛星
  for (var satellite of planet.satellites) {
    // satellite.r = satellite.radius * 0.0000004;
    satellite.r = 7 + satellite.radius * 0.00000003; // デフォルメ半径
    // satellite.size = 8 + satellite.size * 0.00012; // デフォルメ半径
    satellite.size = satellite.size * 0.0002;
    const geometry = new THREE.SphereGeometry(satellite.size, 32, 16);
    const material = new THREE.MeshStandardMaterial({color: satellite.color});
    const mesh = new THREE.Mesh(geometry, material);
    satellite.mesh = mesh;
    // satellite.angle = 10;
    scene.add(mesh);
  }
}

// 環境光源
const alight = new THREE.AmbientLight(0xFFFFFF, 0.1);
scene.add(alight);

// 点光源
const light = new THREE.PointLight(0xFFFFFF, 4, 0, 0);
light.position.set(0, 0, 0);
scene.add(light);

update();

// 更新処理
function update() {
  date.setHours(date.getHours() + 1); // 時間を進める
  const tf = document.getElementById("date");
  tf.innerHTML = date.toLocaleString();

  for (var planet of planets) {
    // 楕円軌道で惑星の位置を計算
    const pos = calculateEllipticalPosition(planet, julian);
    planet.mesh.position.x = pos.x;
    planet.mesh.position.y = pos.y;
    planet.mesh.position.z = pos.z;
    // 現在の軌道半径を保存（軌跡表示用）
    if (pos.r) {
      planet.currentR = pos.r;
    }

    if (planet.index == 3) {
      // camera.position.set(planet.mesh.position.x, planet.mesh.position.y, planet.mesh.position.z);
      camera.lookAt(new THREE.Vector3(planet.mesh.position.x, planet.mesh.position.y, planet.mesh.position.z));
    }

    // 衛星
    for (var satellite of planet.satellites) {
      // 衛星も楕円軌道で計算
      if (satellite.eccentricity !== undefined) {
        const satPos = calculateEllipticalPosition(satellite, julian);
        satellite.mesh.position.x = planet.mesh.position.x + satPos.x;
        satellite.mesh.position.y = planet.mesh.position.y + satPos.y;
        satellite.mesh.position.z = planet.mesh.position.z + satPos.z;
      } else {
        // フォールバック: 正円軌道
        const angle = calculatePlanetAngles(julian, satellite.name);
        satellite.mesh.position.x = planet.mesh.position.x + satellite.r * Math.sin(angle);
        satellite.mesh.position.y = planet.mesh.position.y + 0;
        satellite.mesh.position.z = planet.mesh.position.z + satellite.r * Math.cos(angle);
      }
      // camera.lookAt(new THREE.Vector3(satellite.mesh.position.x, satellite.mesh.position.y, satellite.mesh.position.z));
    }
  }

  // orbitControls.update();
  
  // レンダリング
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  requestAnimationFrame(update);
}

// 軌跡（正円）- 後方互換性のため残す
function orbit(r) {
  const shape = new THREE.Shape()
      .moveTo( 0, 0 )
      .absarc( 0, 0, r, 0, Math.PI * 2, false );
  const points = shape.getPoints(64);
  const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
  let line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
  line.position.set( 0, 0, 0 );
  line.rotation.set( Math.PI/2, 0, 0 );
  line.scale.set( 1, 1, 1 );
  scene.add( line );
}

// 軌跡（楕円）
function orbitEllipse(planet) {
  const a = planet.semiMajorAxis * 0.0000004; // 長半径（スケール調整済み）
  const e = planet.eccentricity;
  const b = a * Math.sqrt(1 - e * e); // 短半径
  
  // 近点引数をラジアンに変換
  const argumentOfPeriapsis = planet.argumentOfPeriapsis * (Math.PI / 180);
  
  // 楕円の点を生成
  const points = [];
  const numPoints = 128;
  
  for (let i = 0; i <= numPoints; i++) {
    const trueAnomaly = (i / numPoints) * Math.PI * 2;
    const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));
    const angle = trueAnomaly + argumentOfPeriapsis;
    
    // 3D空間での位置（XY平面に配置）
    const x = r * Math.sin(angle);
    const y = 0;
    const z = r * Math.cos(angle);
    
    points.push(new THREE.Vector3(x, y, z));
  }
  
  const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(
    geometryPoints,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  scene.add(line);
}

// ケプラー方程式を解く（ニュートン法）
// M: 平均近点角（ラジアン）、e: 離心率
function solveKeplerEquation(M, e) {
    // 初期値として平均近点角を使用
    let E = M;
    const maxIterations = 50;
    const tolerance = 1e-10;

    for (let i = 0; i < maxIterations; i++) {
        const f = E - e * Math.sin(E) - M;
        const fPrime = 1 - e * Math.cos(E);
        
        if (Math.abs(fPrime) < tolerance) break;
        
        const deltaE = f / fPrime;
        E -= deltaE;
        
        if (Math.abs(deltaE) < tolerance) break;
    }

    return E;
}

// 楕円軌道の位置を計算
// planet: 惑星オブジェクト、julian: ユリウス日
function calculateEllipticalPosition(planet, julian) {
    const J2000 = 2451545.0;
    
    // 惑星の基本データ（J2000基準）
    const planets = {
        Mercury: { period: 0.2408467, longitudeAtEpoch: 252.25090552 },
        Venus: { period: 0.61519726, longitudeAtEpoch: 181.97980085 },
        Earth: { period: 1.0000174, longitudeAtEpoch: 100.46645683 },
        Mars: { period: 1.8808476, longitudeAtEpoch: 355.43299958 },
        Jupiter: { period: 11.862615, longitudeAtEpoch: 34.35151874 },
        Saturn: { period: 29.447498, longitudeAtEpoch: 50.07744430 },
        Uranus: { period: 84.016846, longitudeAtEpoch: 314.05500511 },
        Neptune: { period: 164.79132, longitudeAtEpoch: 304.34866548 },
        Pluto: { period: 248.0, longitudeAtEpoch: 238.958 },
        Halley: { period: 75.3, longitudeAtEpoch: 45 },
        Moon: { period: 0.074798, longitudeAtEpoch: 218.31664563 }
    };
    
    const planetData = planets[planet.name];
    if (!planetData) {
        // フォールバック: 正円軌道
        const isRetrograde = planet.isRetrograde || false;
        const meanMotion = isRetrograde ? -360 / (planet.period * 365.25) : 360 / (planet.period * 365.25);
        const meanLongitude = meanMotion * (julian.julian() - J2000) % 360;
        const angle = ((meanLongitude + 360) % 360) * (Math.PI / 180);
        return {
            x: planet.r * Math.sin(angle),
            y: 0,
            z: planet.r * Math.cos(angle)
        };
    }

    // 平均運動 (度/日)
    // 回転方向の設定に基づいて符号を決定（isRetrogradeがtrueの場合は逆行）
    const isRetrograde = planet.isRetrograde || false;
    const meanMotion = isRetrograde ? -360 / (planetData.period * 365.25) : 360 / (planetData.period * 365.25);

    // 平均経度を計算（度）
    const meanLongitudeDeg = (planetData.longitudeAtEpoch + meanMotion * (julian.julian() - J2000)) % 360;
    const meanLongitude = ((meanLongitudeDeg + 360) % 360) * (Math.PI / 180);

    // 近点引数をラジアンに変換
    const argumentOfPeriapsis = planet.argumentOfPeriapsis * (Math.PI / 180);
    
    // 平均近点角を計算: 平均経度 - 近点引数（昇交点黄経は0と仮定）
    // 実際の計算では昇交点黄経も考慮する必要があるが、簡略化のため近点引数のみを考慮
    let meanAnomaly = meanLongitude - argumentOfPeriapsis;
    
    // 角度を0～2πの範囲に正規化
    meanAnomaly = ((meanAnomaly % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

    // ケプラー方程式を解いて離心近点角を求める
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, planet.eccentricity);

    // 真近点角を計算
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + planet.eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - planet.eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // 軌道半径を計算
    const a = planet.semiMajorAxis * 0.0000004; // スケール調整
    const r = a * (1 - planet.eccentricity * planet.eccentricity) / (1 + planet.eccentricity * Math.cos(trueAnomaly));

    // 位置を計算（近点引数を考慮）
    const angle = trueAnomaly + argumentOfPeriapsis;
    const x = r * Math.sin(angle);
    const y = 0;
    const z = r * Math.cos(angle);

    return { x, y, z, r };
}

// 惑星の角度を計算（後方互換性のため残す）
function calculatePlanetAngles(julian, name) {
    // 惑星の基本データ（J2000基準: 2000年1月1日12:00 UT）
    const planetData = {
        Mercury: { period: 0.2408467, longitudeAtEpoch: 252.25090552 },
        Venus: { period: 0.61519726, longitudeAtEpoch: 181.97980085 },
        Earth: { period: 1.0000174, longitudeAtEpoch: 100.46645683 },
        Mars: { period: 1.8808476, longitudeAtEpoch: 355.43299958 },
        Jupiter: { period: 11.862615, longitudeAtEpoch: 34.35151874 },
        Saturn: { period: 29.447498, longitudeAtEpoch: 50.07744430 },
        Uranus: { period: 84.016846, longitudeAtEpoch: 314.05500511 },
        Neptune: { period: 164.79132, longitudeAtEpoch: 304.34866548 },
        Pluto: { period: 248.0, longitudeAtEpoch: 238.958 },
        Halley: { period: 75.3, longitudeAtEpoch: 208.13 },
        Moon: { period: 0.074798, longitudeAtEpoch: 218.31664563 }
    };
    const planet = planetData[name];

    const J2000 = 2451545.0; // ユリウス日2000.0

    // 平均運動 (度/日)
    // 回転方向の設定に基づいて符号を決定（isRetrogradeがtrueの場合は逆行）
    // グローバルのplanets配列から該当する惑星を検索
    const planetObj = planets.find(p => p.name === name);
    const isRetrograde = planetObj ? (planetObj.isRetrograde || false) : false;
    const meanMotion = isRetrograde ? -360 / (planet.period * 365.25) : 360 / (planet.period * 365.25);

    // J2000を基準とした経度計算
    const meanLongitude = (planet.longitudeAtEpoch + meanMotion * (julian.julian() - J2000)) % 360;

    // 経度をラジアンに変換して範囲を調整
    const angle = ((meanLongitude + 360) % 360) * (Math.PI / 180);
    // const angle = meanLongitude * (Math.PI / 180);

    return angle;
}

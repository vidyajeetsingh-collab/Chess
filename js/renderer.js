class Renderer3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0b0910);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 12, 11);

        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        } catch(e) {
            document.getElementById('webgl-error').classList.remove('hidden');
            return;
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below board level
        this.controls.minDistance = 5;
        this.controls.maxDistance = 25;

        this.initLighting();
        this.buildBoardMeshes();
        this.pieceMeshes = [];

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLighting() {
        const ambientLight = new THREE.AmbientLight(0x2a2139, 1.2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xd1b3ff, 1.5);
        dirLight.position.set(5, 15, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x8a2be2, 2, 15);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    buildBoardMeshes() {
        this.boardGroup = new THREE.Group();
        const tileSize = 1;
        const boardGeom = new THREE.BoxGeometry(tileSize, 0.2, tileSize);

        this.tiles = [];
        for (let x = 0; x < 8; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < 8; y++) {
                const isDark = (x + y) % 2 === 1;
                const mat = new THREE.MeshStandardMaterial({
                    color: isDark ? 0x241b35 : 0x4a3565,
                    roughness: 0.4,
                    metalness: 0.2
                });
                const tile = new THREE.Mesh(boardGeom, mat);
                tile.position.set(x - 3.5, 0, y - 3.5);
                tile.receiveShadow = true;
                this.boardGroup.add(tile);
                this.tiles[x][y] = tile;
            }
        }
        this.scene.add(this.boardGroup);
    }

    createPieceMesh(type, color) {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({
            color: color === 'w' ? 0xe2d9f3 : 0x1f162e,
            roughness: 0.3,
            metalness: 0.6
        });

        let geom;
        switch(type) {
            case 'p': geom = new THREE.CylinderGeometry(0.2, 0.3, 0.6, 16); break;
            case 'r': geom = new THREE.BoxGeometry(0.4, 0.7, 0.4); break;
            case 'n': geom = new THREE.ConeGeometry(0.3, 0.8, 16); break;
            case 'b': geom = new THREE.SphereGeometry(0.3, 16, 16); break;
            case 'q': geom = (geom = new THREE.CylinderGeometry(0.15, 0.35, 1.1, 16)); break;
            case 'k': geom = new THREE.BoxGeometry(0.4, 1.3, 0.4); break;
            default: geom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        }

        const mesh = new THREE.Mesh(geom, baseMat);
        mesh.castShadow = true;
        mesh.position.y = 0.5;
        group.add(mesh);
        return group;
    }

    syncPieces(pieces) {
        // Remove old pieces
        this.pieceMeshes.forEach(pm => this.scene.remove(pm.mesh));
        this.pieceMeshes = [];

        pieces.forEach(p => {
            if (!p.alive) return;
            const mesh = this.createPieceMesh(p.type, p.color);
            mesh.position.set(p.x - 3.5, 0.1, p.y - 3.5);
            this.scene.add(mesh);
            this.pieceMeshes.push({ piece: p, mesh: mesh });
        });
    }

    applyFog(fogGrid, isWhitePOV) {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const visible = fogGrid[x][y];
                const tile = this.tiles[x][y];
                // Dim or brighten tile based on visibility
                tile.material.emissive.setHex(visible ? 0x000000 : 0x050308);
                tile.material.opacity = visible ? 1.0 : 0.2;
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

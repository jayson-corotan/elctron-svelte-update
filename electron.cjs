const { app, BrowserWindow, autoUpdater, dialog, ipcMain } = require('electron')
const serve = require('electron-serve');
const ws = require('electron-window-state');
//try { require("electron-reloader")(module); } catch {}
console.log("Version", app.getVersion())
let port = process.env.PORT || 5173;
let isdev = !app.isPackaged || process.env.NODE_ENV == 'development';
// let isdev = process.env.NODE_ENV == 'development';
let mainwindow;


const EOL = require('os').EOL
const fs = require('fs')
const url = require('url')
const path = require('path')

let CWD = process.cwd()
const rootDir = CWD

const loadURL = serve({ directory: 'build' });

function loadVite(port) {
	mainwindow.loadURL(`http://localhost:${port}`).catch(() => {
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

const jsreport = require('jsreport')({
	rootDirectory: rootDir
})

function createMainWindow() {
	// @ts-ignore
	let mws = ws({
		defaultWidth: 1000,
		defaultHeight: 800
	});

	mainwindow = new BrowserWindow({
		x: mws.x,
		y: mws.y,
		width: mws.width,
		height: mws.height,

		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			devTools: true,
			// preload: path.join(__dirname, 'preload.cjs')
		}
	});

	mainwindow.once('close', () => {
		mainwindow = null;
	});
	mws.manage(mainwindow);
	if (isdev) {
		mainwindow.webContents.openDevTools();
		loadVite(port);
	} else {
		// mainwindow.removeMenu();
		loadURL(mainwindow);
	}
	// if (isdev) mainwindow.webContents.openDevTools();
	// mws.manage(mainwindow);

	// if (isdev) loadVite(port);
	// else loadURL(mainwindow);
	// ipcMain.on('render-start', async (event, args) => {
	// 	appLog('info', 'initializing reporter..')

	// handling action that was generated from renderer process
	ipcMain.on('render-start', async (event, args) => {
		appLog('info', 'initializing reporter..')

		try {
			// we defer jsreport initialization on first report render
			// to avoid slowing down the app at start time
			if (!jsreport._initialized) {
				await jsreport.init()
				appLog('info', 'jsreport started')
			}

			appLog('info', 'rendering report..')

			try {
				const resp = await jsreport.render({
					template: {
						content: fs.readFileSync(path.join(__dirname, './report.html')).toString(),
						engine: 'handlebars',
						recipe: 'chrome-pdf'
					},
					data: {
						rows: args.rows,
						data: args.data
					}
				})

				appLog('info', 'report generated')

				fs.writeFileSync(path.join(CWD, 'report.pdf'), resp.content)

				const pdfWindow = new BrowserWindow({
					width: 1024,
					height: 800,
					webPreferences: {
						plugins: true
					}
				})

				pdfWindow.loadURL(url.format({
					pathname: path.join(CWD, 'report.pdf'),
					protocol: 'file'
				}))

				event.sender.send('render-finish', {})
			} catch (e) {
				appLog('error', `error while generating or saving report: ${e.stack}`)
				event.sender.send('render-finish', { errorText: e.stack })
			}
		} catch (e) {
			appLog('error', `error while starting jsreport: ${e.stack}`)
			app.quit()
		}
	})

}
// app.once('ready', createMainWindow);
app.whenReady().then(() => {
	ipcMain.handle('ping', () => 'pong')
	createMainWindow()
})
app.on('activate', () => {
	if (!mainwindow) createMainWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
	})
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
	appLog('error', `Uncaught error: ${err.stack}`)
	throw err
})

// function to save app logs, it writes to console and to a file.
// writing to a file is handy because when running the app from normal
// executable there is no console to see logs
function appLog(level, message) {
	const origMsg = message

	message += EOL

	if (level === 'info') {
		console.log(origMsg)
		fs.appendFileSync(path.join(CWD, 'app-info.log'), message)
	} else if (level === 'error') {
		console.error(origMsg)
		fs.appendFileSync(path.join(CWD, 'app-error.log'), message)
	}
}

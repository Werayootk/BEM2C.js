const chalk = require('chalk');
const boxen = require('boxen');
const xml2js = require('xml2js');
const esprima = require('esprima');
const fs_promises = require('fs').promises;
const fs = require('fs');
const path = require('path');

const usage = chalk.hex('#83aaff')('\nUsage: bem2c <command>');
const packageJson = require('../package.json');
module.exports = {
  showHelp: showHelp,
  showVersion: showVersion,
  showExample: showExample,
  forwardEngineering: forwardEngineering,
  reverseEngineering: reverseEngineering,
};

function showVersion() {
  console.log(chalk.magenta.bold(`\nVersion :\t\t${packageJson.version}\n`));
}

function showHelp() {
  console.log(usage);
  console.log('Command:\r');
  console.log('\t--version\t      ' + 'Show version number.');
  console.log('\t--list\t\t      ' + 'Show help.' + '\t\t');
  console.log(
    '\t-m\t\t      ' + 'method transformation. (forward or reverse)' + '\t\t'
  );
  console.log(
    '\t-i\t\t      ' +
      'path input. (forward method is path xmi but if reverse method is path source code.)' +
      '\t\t'
  );
  console.log(
    '\t-o\t\t      ' +
      'path output.(forward method is path source code but if reverse method is path xmi.)' +
      '\t\t'
  );
}

function showExample() {
  console.log(
    '\n' +
      boxen(chalk.green('\n' + 'Example Forward Method' + '\n'), {
        padding: 1,
        borderColor: 'green',
        dimBorder: true,
        borderStyle: 'classic',
      }) +
      '\n'
  );
  console.log(
    chalk.green(
      'bem2c -m forward -i <path_of_xmi> -o <path_of_source_code>\t  '
    )
  );
  console.log(
    '\n' +
      boxen(chalk.red('\n' + 'Example Reverse Method' + '\n'), {
        padding: 1,
        borderColor: 'red',
        dimBorder: true,
        borderStyle: 'classic',
      }) +
      '\n'
  );
  console.log(
    chalk.red('bem2c -m reverse -t <type_of_database> -i <path_of_source_code> -o <path_of_xmi>\t  ')
  );
}

async function forwardEngineering(inputPath, outPath) {
  const xmiToJson = await convertXMIToJSON(inputPath);
  // const pathJson = path.join(__dirname, `../json/converted.json`);
  const { profileConfig, dataTypeConfig, packageConfig } =
    // await processJsonFile(pathJson);
    await processJsonFile(xmiToJson);
  const data = {
    profile: profileConfig,
    type: dataTypeConfig,
    package: packageConfig,
  };
  const routeContent = generateRouter(data);
  const modelContent = generateModel(data);
  const controllerContent = generateController(data);
  // Define the folder and file names
  const folderNameService = outPath + '/backend';
  const folderNameRoute = folderNameService + '/' + 'routes';
  const folderNameModel = folderNameService + '/' + 'models';
  const folderNameController = folderNameService + '/' + 'controllers';

  function createRouteFiles(pathFile) {
    routeContent.forEach((item) => {
      const pathFolderAndFile = pathFile + '/' + item.nameOfFile;
      const fileContent = item.contentWithComment.join('');
      fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Content writing to ${item.nameOfFile}`);
        }
      });
    });
  }

  function createIndexRouteFile(pathFile) {
    let fileContent = '';
    const pathFolderAndFile = pathFile + '/index.js';
    let importName = `const express = require('express');\nconst router = express.Router();\n`
    let exportName = `module.exports = router;`;
    let requireGroup = '<<requireGroup>>';
    let routeGroup = '<<routeGroup>>';
    let importRouteGroup = '';
    let exportRouteGroup = '';
    
    routeContent.forEach((item) => {
      importRouteGroup += `const ${item.nameOfFile.split('.')[0] + 'Routes'} = require('./${item.nameOfFile.replace('.js','')}');\n`
      exportRouteGroup += `router.use('/', ${item.nameOfFile.split('.')[0] + 'Routes'});\n`
    });

    fileContent += importName;
    fileContent += requireGroup;
    fileContent += routeGroup;
    fileContent += exportName;
    fileContent = fileContent.replace('<<requireGroup>>', importRouteGroup);
    fileContent = fileContent.replace('<<routeGroup>>', exportRouteGroup);

    fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Content writing to`);
      }
    });
  }

  function createModelFiles(pathFile) {
    modelContent.forEach((item) => {
      const pathFolderAndFile = pathFile + '/' + item.nameOfFile;
      const fileContent = item.contentFile.join('');
      fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Content writing to ${item.nameOfFile}`);
        }
      });
    });
  }

  function createIndexModelFile(pathFile) {
    let fileContent = '';
    const pathFolderAndFile = pathFile + '/index.js';
    let importMongoose = `const mongoose = require('mongoose');\nrequire('dotenv').config();\nmongoose.connect(process.env.MONGO_URI, {\n  useNewUrlParser: true,\n  useUnifiedTopology: true,\n});\n`
    let exportDbName = `const db = { <<modelGroup>> mongoose,\nconnection: mongoose.connection,\n}`;
    let exportName = `module.exports = { db }`;
    let exportGroup = '';
    let sqlTemplate = `
    'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

let sequelize;
sequelize = new Sequelize(process.env.DB_MYSQL, process.env.USER_MYSQL, process.env.PASS_MYSQL, {
  host: process.env.HOST_MYSQL,
  dialect: process.env.DIALECT,
});

fs.readdirSync(__dirname)
  .filter(file => {
    return file !== basename && file.endsWith('.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {
  db,
  sequelize,
};
    `;
    let noSqlTemplate = '';

    modelContent.forEach((item) => {
      if (item.typeDB === 'MySQL') {
        fileContent = sqlTemplate;
      } else if (item.typeDB === 'MongoDB') {
        let dbName = `${item.nameOfFile.replace('.js', '').split('.')[0].charAt(0).toUpperCase() + item.nameOfFile.replace('.js', '').split('.')[0].slice(1)}: require('./${item.nameOfFile.replace('.js', '')}'),\n`
        noSqlTemplate += dbName;
      }
    });
    fileContent += importMongoose;
    fileContent += exportDbName;
    fileContent += exportName;
    fileContent = fileContent.replace('<<modelGroup>>', noSqlTemplate);

    fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Content writing to`);
      }
    });
  }

  function createControllerFiles(pathFile) {
    controllerContent.forEach((item) => {
      const pathFolderAndFile = pathFile + '/' + item.nameOfFile;
      const fileContent = item.contentFile.join('');
      fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Content writing to ${item.nameOfFile}`);
        }
      });
    });
  }

  function createIndexControllerFile(pathFile) {
    let fileContent = '';
    const pathFolderAndFile = pathFile + '/index.js';
    let exportName = `module.exports = { <<controllerName>> }`;
    let exportGroup = '';
    
    controllerContent.forEach((item) => {
      let importName = `const ${item.nameController.charAt(0).toLowerCase() + item.nameController.slice(1)} = require('./${item.nameOfFile.replace('.js','')}');\n`
      fileContent += importName;
      exportGroup += `${item.nameController.charAt(0).toLowerCase() + item.nameController.slice(1)},\n`
    });
    
    exportName = exportName.replace('<<controllerName>>', exportGroup);
    fileContent += exportName;
    
    fs.writeFileSync(pathFolderAndFile, fileContent, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Content writing to`);
      }
    });
  }

  // Create Root Folder
  const folderRootPath = folderNameService;
  if (!fs.existsSync(folderRootPath)) {
    fs.mkdirSync(folderRootPath);
    console.log(`Folder '${folderNameService}' created.`);
  } else {
    console.log(`Folder '${folderNameService}' already exists.`);
  }

  // Create Routes Folder
  const folderRoutePath = folderNameRoute;
  if (!fs.existsSync(folderRoutePath)) {
    fs.mkdirSync(folderRoutePath);
    console.log(`Folder '${folderNameRoute}' created.`);
    createRouteFiles(folderRoutePath);
    createIndexRouteFile(folderRoutePath);
  } else {
    console.log(`Folder '${folderNameRoute}' already exists.`);
    createRouteFiles(folderRoutePath);
    createIndexRouteFile(folderRoutePath);
  }

  // Create Model Folder
  const folderModelPath = folderNameModel;
  if (!fs.existsSync(folderModelPath)) {
    fs.mkdirSync(folderModelPath);
    console.log(`Folder '${folderNameModel}' created.`);
    createModelFiles(folderModelPath);
    createIndexModelFile(folderModelPath);
  } else {
    console.log(`Folder '${folderNameModel}' already exists.`);
    createModelFiles(folderModelPath);
    createIndexModelFile(folderModelPath);
  }

  // Create Controller Folder
  const folderControllerPath = folderNameController;
  if (!fs.existsSync(folderControllerPath)) {
    fs.mkdirSync(folderControllerPath);
    console.log(`Folder '${folderNameController}' created.`);
    createControllerFiles(folderControllerPath);
    createIndexControllerFile(folderControllerPath);
  } else {
    console.log(`Folder '${folderNameController}' already exists.`);
    createControllerFiles(folderControllerPath);
    createIndexControllerFile(folderControllerPath);
  }

  console.log(
    '\n' +
      boxen(chalk.green('\n' + 'Forward Method Successfully.' + '\n'), {
        padding: 1,
        borderColor: 'green',
        dimBorder: true,
        borderStyle: 'classic',
      }) +
      '\n'
  );
}

async function reverseEngineering(inputPath, outPath, typeDB) {
  const { modelData, controllerData, routeData } = await extractDataFromProject(
    inputPath, typeDB
  );
  const data = {
    model: modelData,
    controller: controllerData,
    route: routeData,
  };
  console.log('data', data);
  
  await generateXMI(data, outPath);
  console.log(
    '\n' +
      boxen(chalk.green('\n' + 'Reverse Method Successfully.' + '\n'), {
        padding: 1,
        borderColor: 'green',
        dimBorder: true,
        borderStyle: 'classic',
      }) +
      '\n'
  );
}

async function convertXMIToJSON(pathFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathFile, 'utf-8', (err, data) => {
      if (err) {
        console.error(chalk.red('Error reading XMI file:', err));
        reject();
      }
      xml2js.parseString(data, { explicitArray: false }, (err, result) => {
        if (err) {
          console.error(chalk.red('Error parsing XML:', err));
          reject();
        }
        const jsonResult = JSON.stringify(result, null, 2);
        return resolve({
          jsonResult,
        });
        // const jsonFileName = path.join(__dirname, `../json/converted.json`);
        // fs.writeFile(jsonFileName, jsonResult, 'utf-8', (err) => {
        //   if (err) {
        //     console.error(chalk.red('Error writing JSON file:', err));
        //     reject();
        //   } else {
        //     console.log(
        //       chalk.green('JSON file saved successfully:', jsonFileName)
        //     );
        //     resolve();
        //   }
        // });
      });
    });
  });
}

async function processJsonFile(json) {
  return new Promise((resolve, reject) => {
    const profileConfig = [];
    const dataTypeConfig = [];
    const packageConfig = [];

    function mapProfile(obj) {
      for (const item of obj) {
        if (item.$['xmi:type'] === 'uml:Stereotype') {
          let objProfileMap = {
            id: '',
            name: '',
          };
          objProfileMap.id = item.$['xmi:id'];
          objProfileMap.name = item.$.name;
          profileConfig.push(objProfileMap);
        }
      }
      return profileConfig;
    }

    function mapDataType(obj) {
      let objDataTypeMap = {
        id: '',
        name: '',
      };
      objDataTypeMap.id = obj['xmi:id'];
      objDataTypeMap.name = obj.name;
      dataTypeConfig.push(objDataTypeMap);
      return dataTypeConfig;
    }

    function mapPackage(obj) {
      for (const item of obj) {
        if (item.$['xmi:type'] === 'uml:Package') {
          if (item.$.name === 'Model') {
            for (const elem of item.packagedElement) {
              let objModel = {
                nameId: '',
                name: '',
                stereotype: '',
                attribute: [],
                association: [],
                pairModel: [],
              };
              objModel.nameId = elem.$['xmi:id'];
              objModel.name = elem.$.name;
              objModel.stereotype = elem['xmi:Extension'].stereotype.$.value;
              if (elem['ownedAttribute']?.length) {
                for (const attr of elem['ownedAttribute']) {
                  if (attr['xmi:Extension']?.stereotype.$.value != undefined) {
                    let objAttr = {
                      attrId: attr.$['xmi:id'],
                      attrName: attr.$.name,
                      attrType: attr.$.type,
                      attrKey: attr['xmi:Extension'].stereotype.$.value,
                    };
                    objModel.attribute.push(objAttr);
                  } else {
                    let objAttr = {
                      attrId: attr.$['xmi:id'],
                      attrName: attr.$.name,
                      attrType: attr.$.type,
                      attrKey: 'no_key',
                    };
                    objModel.attribute.push(objAttr);
                  }
                }
              } else {
                // Only one attr
                let objAttr = {
                  attrId: elem['ownedAttribute'].$['xmi:id'],
                  attrName: elem['ownedAttribute'].$.name,
                  attrType: elem['ownedAttribute'].$.type,
                  attrKey: 'no_key',
                };
                objModel.attribute.push(objAttr);
              }
              if (elem['ownedMember']?.length) {
                for (const ass of elem['ownedMember']) {
                  if (ass.ownedEnd?.length) {
                    for (const e of ass.ownedEnd) {
                      let objAss = {
                        assId: e.$['xmi:id'],
                        modelId: e.$.type,
                        lowerValue: e.lowerValue.$.value,
                        upperValue: e.upperValue.$.value,
                      };
                      objModel.association.push(objAss);
                    }
                    let objPairModel = {
                      id1: ass.memberEnd[0].$['xmi:idref'],
                      id2: ass.memberEnd[1].$['xmi:idref'],
                    };
                    objModel.pairModel.push(objPairModel);
                  }
                }
              } else if (elem['ownedMember']) {
                if (elem['ownedMember']?.ownedEnd?.length) {
                  for (const e of elem['ownedMember'].ownedEnd) {
                    let objAss = {
                      assId: e.$['xmi:id'],
                      modelId: e.$.type,
                      lowerValue: e.lowerValue.$.value,
                      upperValue: e.upperValue.$.value,
                    };
                    objModel.association.push(objAss);
                  }
                  let objPairModel = {
                    id1: elem['ownedMember'].memberEnd[0].$['xmi:idref'],
                    id2: elem['ownedMember'].memberEnd[1].$['xmi:idref'],
                  };
                  objModel.pairModel.push(objPairModel);
                }
              }
              packageConfig.push(objModel);
            }
          } else if (item.$.name === 'Route') {
            for (const elem of item.packagedElement) {
              let objResource = {
                nameId: '',
                name: '',
                stereotype: '',
                operation: [],
                routePath: [],
              };
              objResource.nameId = elem.$['xmi:id'];
              objResource.name = elem.$.name;
              objResource.stereotype = elem['xmi:Extension'].stereotype.$.value;
              if (elem.ownedOperation?.length) {
                for (const opr of elem.ownedOperation) {
                  let objOperation = {
                    nameOpr: opr.$.name,
                    method: opr['xmi:Extension'].stereotype.$.value,
                  };
                  objResource.operation.push(objOperation);
                }
              } else if (elem.ownedOperation) {
                let objOperation = {
                  nameOpr: elem.ownedOperation.$.name,
                  method:
                    elem.ownedOperation['xmi:Extension'].stereotype.$.value,
                };
                objResource.operation.push(objOperation);
              }
              if (elem.ownedMember?.length) {
                for (const path of elem.ownedMember) {
                  let objRoute = {
                    fromPath: elem.$.name,
                    param: path.$.name,
                    startPath: path.$.client,
                    endPath: path.$.supplier,
                  };
                  objResource.routePath.push(objRoute);
                }
              } else if (elem.ownedMember) {
                let objRoute = {
                  fromPath: elem.$.name,
                  param: elem.ownedMember.$.name,
                  startPath: elem.ownedMember.$.client,
                  endPath: elem.ownedMember.$.supplier,
                };
                objResource.routePath.push(objRoute);
              }
              packageConfig.push(objResource);
            }
          } else if (item.$.name === 'Controller') {
            for (const elem of item.packagedElement) {
              let objController = {
                nameId: '',
                name: '',
                stereotype: '',
                operation: [],
              };
              objController.nameId = elem.$['xmi:id'];
              objController.name = elem.$.name;
              objController.stereotype =
                elem['xmi:Extension']?.stereotype.$.value;
              if (elem.ownedOperation?.length) {
                for (const opr of elem.ownedOperation) {
                  let objOperation = {
                    nameOpr: opr.$.name,
                    method: opr['xmi:Extension']?.stereotype.$.value,
                  };
                  objController.operation.push(objOperation);
                }
              } else if (elem.ownedOperation) {
                let objOperation = {
                  nameOpr: elem.ownedOperation.$.name,
                  method:
                    elem.ownedOperation['xmi:Extension']?.stereotype.$.value ||
                    '',
                };
                objController.operation.push(objOperation);
              }
              packageConfig.push(objController);
            }
          } else if (item.$.name === 'Database') {
            let objDatabase = {
              nameId: '',
              name: '',
              stereotype: '',
            };
            objDatabase.nameId = item.packagedElement.$['xmi:id'];
            objDatabase.name = item.packagedElement.$.name;
            objDatabase.stereotype =
              item.packagedElement['xmi:Extension'].stereotype.$.value;
            packageConfig.push(objDatabase);
          }
        }
      }
      return packageConfig;
    }

    // const jsonData = fs.readFileSync(json, 'utf-8');
    // const jsonObj = JSON.parse(jsonData);
    const jsonObj = JSON.parse(json.jsonResult);
    if (
      jsonObj['xmi:XMI']['uml:Model'].$['xmi:type'] === 'uml:Model' &&
      jsonObj['xmi:XMI']['uml:Model'].$.name === 'RootModel'
    ) {
      const uml = jsonObj['xmi:XMI']['uml:Model'].packagedElement;
      let package;
      for (const obj of uml) {
        if (obj.$['xmi:type'] === 'uml:Profile') {
          mapProfile(obj.packagedElement);
        } else if (obj.$['xmi:type'] === 'uml:DataType') {
          mapDataType(obj.$);
        } else if (obj.$['xmi:type'] === 'uml:Model') {
          package = obj.packagedElement;
        }
      }
      mapPackage(package);
    }
    resolve({
      profileConfig,
      dataTypeConfig,
      packageConfig,
    });
  });
}

function generateRouter(data) {
  let result = [];
  const mapProfileObj = data.profile
    .filter((item) =>
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'Route'].includes(item.name)
    )
    .reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  const filteredData = data.package.filter(
    (item) => mapProfileObj[item.stereotype] === 'Route'
  );
  let endPathList = [];
  filteredData.forEach((element) => {
    if (element.routePath.length != 0) {
      element.routePath.forEach((path) => endPathList.push(path.endPath));
    }
  });

  const idToNameMap = {};
  filteredData.forEach((obj) => {
    idToNameMap[obj.nameId] = obj.name;
  });

  let allDependency = [];
  filteredData.forEach((e) => {
    let pathNext = [];
    if (e.routePath.length != 0) {
      e.routePath.forEach((p) => {
        let obj = {
          from: e.name,
          param: p.param,
          to: idToNameMap[p.endPath],
        };
        pathNext.push(obj);
      });
      allDependency.push(pathNext);
    }
  });

  filteredData.forEach((element) => {
    let newPath = {
      nameOfFile: '',
      contentFile: [],
      contentWithComment: [],
    };

    if (!endPathList.includes(element.nameId)) {
      newPath.nameOfFile = `${element.name
        .toLowerCase()
        .replace('route', '')}.route.js`;
      let dependency = [];
      let resource = [];
      let methodName = [];
      let controllerName = [];
      let content = '';
      let method = '';
      let path = '';
      let controller = '';
      let templateRoute = '';
      element.operation.forEach((opr) => {
        method = mapProfileObj[opr.method];
        path = element.name.toLowerCase().replace('route', '');
        controller = opr.nameOpr;
        templateRoute = `\nrouter.${method.toLowerCase()}("/${path}/${controller}", ${controller});`;
        content = templateRoute;
        resource.push(element.name);
        methodName.push(method);
        controllerName.push(controller);
        newPath.contentFile.push(content);
      });
      const uniqueCombinations = new Set();
      function nextRoutePath(route, currentPath) {
        if (route.length == 0) {
          return;
        }
        for (const iterator of route) {
          for (const elem of filteredData) {
            if (iterator.endPath == elem.nameId) {
              allDependency.forEach((i) => {
                i.forEach((j) => {
                  if (iterator.fromPath == j.from) {
                    const combination = `${j.from}-${j.param}-${j.to}`;
                    if (!uniqueCombinations.has(combination)) {
                      uniqueCombinations.add(combination);
                      dependency.push(j);
                    }
                  }
                });
              });
              
              elem.operation.forEach((elem_opr) => {
                resource.push(elem.name);
                method = mapProfileObj[elem_opr.method];
                methodName.push(method);
                isCheckPath = iterator.param;
                let defineNewPath = '';
                if (isCheckPath == '/') {
                  defineNewPath = '';
                } else {
                  defineNewPath = iterator.param;
                }
                path = `${currentPath}/${elem.name
                  .toLowerCase()
                  .replace('route', '')}${defineNewPath}`;
                controller = elem_opr.nameOpr;
                templateRoute = `\nrouter.${method?.toLowerCase()}("/${path}/${controller}", ${controller});`;
                content = templateRoute;
                controllerName.push(controller);
                newPath.contentFile.push(content);
              });
              nextRoutePath(elem.routePath, path.replace('Route', ''));
            }
          }
        }
      }
      nextRoutePath(
        element.routePath,
        element.name.toLowerCase().replace('route', '')
      );
      let commentSection = `
  const express = require("express");
  
  const router = express.Router();
          `;
      let exportSection = `
  
  module.exports = router;
        `;
      const concatenatedString = newPath.contentFile.join('');
      commentSection = commentSection + concatenatedString + exportSection;
      newPath.contentWithComment.push(commentSection);
      result.push(newPath);
    }
  });
  return result;
}

function generateModel(data) {
  let result = [];
  const mapType = data.type
    .filter((item) =>
      [
        'String',
        'Boolean',
        'Integer',
        'Float',
        'Date',
        'Id',
        'Array',
        'Number',
        'UUID'
      ].includes(item.name)
    )
    .reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  const mapProfile = data.profile
    .filter((item) =>
      ['Model', 'Database', 'PK', 'FK', 'REF', 'EMD'].includes(item.name)
    )
    .reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  const filteredDataModel = data.package.filter(
    (item) => mapProfile[item.stereotype] === 'Model'
  );
  const idToNameMap = {};
  filteredDataModel.forEach((obj) => {
    idToNameMap[obj.nameId] = obj.name;
  });
  const filteredDataDB = data.package.filter(
    (item) => mapProfile[item.stereotype] === 'Database'
  );
  const isSQL = filteredDataDB[0].name === 'MySQL';
  const isNoSQL = filteredDataDB[0].name === 'MongoDB';
  let database = [];
  database.push(filteredDataDB[0].name);

  if (isSQL) {
    filteredDataModel.forEach((element) => {
      let newModel = {
        nameOfFile: '',
        contentFile: [],
        typeDB: 'MySQL',
      };
      newModel.nameOfFile = `${element.name
        .toLowerCase()
        .replace('model', '')}.model.js`;
      let model = [];
      model.push(element.name);
      let relations = [];
      if (element.pairModel?.length) {
        for (const a of element.pairModel) {
          const filteredRelations = element.association.filter(
            (item) => item.assId === a.id2
          );
          relations.push(idToNameMap[filteredRelations[0].modelId]);
        }
      }
      let fieldTemplate = '';
      let attribute = [];
      if (element.attribute?.length != 0) {
        element.attribute.forEach((attr) => {
          attribute.push({ name: attr.attrName, type: mapType[attr.attrType] });
          // if (attr.attrKey != 'no_key' && mapProfile[attr.attrKey] === 'PK') {
          if (mapType[attr.attrType] == "Id") {
            fieldTemplate += `
    ${attr.attrName}: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },`;
          } else {
            let type = mapType[attr.attrType];
            if (type == 'Number') {
              type = 'INTEGER';
            }
            fieldTemplate += `
    ${attr.attrName}: {
    type: DataTypes.${type.toUpperCase()},
    },`;
          }
        });
        let commentSection = `
        `;
        let modelTemplate = `
  ${commentSection}
  module.exports = (sequelize, DataTypes) => {
    const ${element.name.replace('Model', '')} = sequelize.define(
      "${element.name.replace('Model', '')}",
      {
        ${fieldTemplate}
      },{
        timestamps: true
      }
    );
  
    return ${element.name.replace('Model', '')};
  };
        `;
        newModel.contentFile.push(modelTemplate);
        result.push(newModel);
      }
    });
  } else if (isNoSQL) {
    filteredDataModel.forEach((element) => {
      let newModel = {
        nameOfFile: '',
        contentFile: [],
        typeDB: 'MongoDB',
      };
      newModel.nameOfFile = `${element.name
        .toLowerCase()
        .replace('model', '')}.model.js`;
      let model = [];
      model.push(element.name);
      let relations = [];
      if (element.pairModel?.length) {
        for (const a of element.pairModel) {
          const filteredRelations = element.association.filter(
            (item) => item.assId === a.id2
          );
          relations.push(idToNameMap[filteredRelations[0].modelId]);
        }
      }
      let fieldTemplate = '';
      let attribute = [];
      if (element.attribute?.length != 0) {
        element.attribute.forEach((attr) => {
          attribute.push({ name: attr.attrName, type: mapType[attr.attrType] });
          if (attr.attrKey != 'no_key' && mapProfile[attr.attrKey] === 'REF') {
            fieldTemplate += `
              ${attr.attrName}: {
                type: mongoose.Schema.Types.ObjectId,
                ref: '${attr.attrName.replace('Id', '')}'
              },
                `;
          } else if (
            attr.attrKey != 'no_key' &&
            mapProfile[attr.attrKey] === 'PK'
          ) {
            // SKIP
          } else {
            fieldTemplate += `
              ${attr.attrName}: {
                type: ${mapType[attr.attrType] || ''}
              },
                `;
          }
        });
        let commentSection = `
    `;
        let modelTemplate = `
  ${commentSection}
  const mongoose = require("mongoose");
  const ${
    element.name.toLowerCase().replace('model', '') + 'Schema'
  } = mongoose.Schema(
    {
      ${fieldTemplate}
    },
    {
      timestamps: true,
    }
  );
  const ${element.name.replace(
    'Model',
    ''
  )} = mongoose.model("${element.name.replace('Model', '')}", ${
          element.name.toLowerCase().replace('model', '') + 'Schema'
        });
  module.exports = ${element.name.replace('Model', '')};
    `;
        newModel.contentFile.push(modelTemplate);
        result.push(newModel);
      }
    });
  } else {
    throw new Error("Can't Detection Database type.");
  }

  return result;
}

function generateController(data) {
  let result = [];
  const mapProfile = data.profile
    .filter((item) => ['Controller'].includes(item.name))
    .reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  const filteredData = data.package.filter(
    (item) => mapProfile[item.stereotype] === 'Controller'
  );
  filteredData.forEach((element) => {
    let newController = {
      nameOfFile: '',
      contentFile: [],
      nameController: '',
    };
    let controllerTemplate = '';
    newController.nameController = element.name;
    newController.nameOfFile = `${element.name
      .toLowerCase()
      .replace('controller', '')}.controller.js`;
    let className = [];
    className.push(element.name);
    let controllerContent = '';
    if (element.operation?.length != 0) {
      let controllerName = [];
      element.operation.forEach((opr) => {
        controllerName.push(opr.nameOpr);
        controllerTemplate += `${opr.nameOpr},\n`;
        let templateController = `
  const ${opr.nameOpr} = asyncHandler(async (req, res) => { res.send("${element.name}"); })\n`;
        controllerContent += templateController;
      });
      let commentSection = `
  const asyncHandler = require("express-async-handler");
        `;

      let exportSection = `
  module.exports = {
    ${controllerTemplate}
  };
        `;
      let contentWithComment =
        commentSection + controllerContent + exportSection;
      newController.contentFile.push(contentWithComment);
    }
    result.push(newController);
  });
  return result;
}

async function analyzeRoutes(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const ast = esprima.parseModule(sourceCode);
  const routeClass = [];
  const methodName = [];
  const controllerName = [];
  const nextPathMap = new Map();

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function processPath(path) {
    const segments = path.split('/').filter(Boolean);
    const params = path.match(/:[^\/]+/g) || [];
    
    // ไม่เอา segment สุดท้ายเพราะเป็น action
    const pathSegments = segments.slice(0, -1); 
    
    let className;
    if (params.length > 0) {
      // หา segment ก่อนหน้า param ตัวสุดท้าย
      for (let i = pathSegments.length - 1; i >= 0; i--) {
        if (!pathSegments[i].startsWith(':')) {         
          className = capitalizeFirst(pathSegments[i].slice(0)) + 'Route';
          break;
        }
      }
    } else {
      className = capitalizeFirst(pathSegments[0]) + 'Route';
    }
  
    return { className, segments: pathSegments, params };
  }
  
  function buildNextPath(pathSegments) {
    const segments = pathSegments.slice(0);
    const relationships = new Map();
   
    // วนลูปจากท้ายไปต้น
    for (let i = segments.length - 1; i >= 0; i--) {
        const currentSegment = segments[i];
        
        // เจอ : (ข้อ 2 ในลอจิค)
        if (currentSegment.startsWith(':')) {
            const param = '/' + currentSegment;
            
            // วนหา to (ข้อ 3-4 ในลอจิค)
            let toIndex = i - 1;
            while (toIndex >= 0 && segments[toIndex].startsWith(':')) {
                toIndex--;
            }
            if (toIndex < 0) continue;
            
            const to = capitalizeFirst(segments[toIndex].slice(0)) + 'Route';
            
            // วนหา from (ข้อ 5-6 ในลอจิค)
            let fromIndex = toIndex - 1;
            while (fromIndex >= 0 && segments[fromIndex].startsWith(':')) {
                fromIndex--;
            }
            if (fromIndex < 0) continue;
            
            const from = capitalizeFirst(segments[fromIndex]) + 'Route';
            
            relationships.set(`${from}-${param}-${to}`, {
                from,
                param,
                to
            });
            break;  // เจอครบ from-to-param แล้วออกเลย
        }
    }
    
    return Array.from(relationships.values());
}

  ast.body.forEach(node => {
    if (node.type === 'ExpressionStatement' && 
        node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.object.name === 'router') {

      const method = node.expression.callee.property.name.toUpperCase();
      const path = node.expression.arguments[0].value;
      const handler = node.expression.arguments[1].type === 'Identifier' ? 
        node.expression.arguments[1].name : 
        node.expression.arguments[1].property.name;

      const pathInfo = processPath(path);
      routeClass.push(pathInfo.className);
      methodName.push(method);
      controllerName.push(handler);
      
      const relationships = buildNextPath(pathInfo.segments);
      relationships.forEach(rel => {
        const key = `${rel.from}-${rel.param}-${rel.to}`;
        if (!nextPathMap.has(key)) {
          nextPathMap.set(key, rel);
        }
      });
    }
  });

  return {
    routeClass,
    methodName,
    controllerName,
    nextPath: Array.from(nextPathMap.values())
  };
}

async function dataInRoute(pathFile) {
  try {
    const fileRouteContent = await fs_promises.readFile(pathFile, 'utf-8');
    const result = await analyzeRoutes(pathFile);
    const data = {
      resource: result.routeClass,
      dependencyName: result.nextPath,
      methodName: result.methodName,
      controllerName: result.controllerName,
    };
    return await data;
  } catch (err) {
    console.error('Error reading the file:', err.message);
  }
}

async function analyzeMongooseModel(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const ast = esprima.parseModule(sourceCode);
  const modelName = [];
  const attribute = [];
  const databaseType = ["MongoDB"];

  try {
    // Find mongoose.model call to get model name
    ast.body.forEach(node => {
      if (node.type === 'VariableDeclaration' &&
          node.declarations[0]?.init?.type === 'CallExpression' &&
          node.declarations[0]?.init?.callee?.property?.name === 'model') {
        const rawModelName = node.declarations[0].init.arguments[0].value;
        modelName.push(rawModelName + 'Model');
      }
      
      // Find mongoose.Schema to get attributes
      if (node.type === 'VariableDeclaration' &&
          node.declarations[0]?.init?.type === 'CallExpression' &&
          node.declarations[0]?.init?.callee?.property?.name === 'Schema') {
        
        const schemaProperties = node.declarations[0].init.arguments[0].properties;
        
        schemaProperties.forEach(prop => {
          const fieldName = prop.key.name;
          const fieldProps = prop.value.properties;
          
          // Get type from field properties
          const typeProperty = fieldProps.find(p => p.key.name === 'type');
          
          if (typeProperty) {
            let fieldType;
            
            // Handle both simple types and mongoose.Types.ObjectId
            if (typeProperty.value.type === 'Identifier') {
              fieldType = typeProperty.value.name;
            } else if (typeProperty.value.type === 'MemberExpression' && 
                      typeProperty.value.property.name === 'ObjectId') {
              // Skip reference fields
              return;
            }
            
            attribute.push({
              name: fieldName,
              type: fieldType
            });
          }
        });
      }
    });

    return {
      modelName,
      attribute,
      databaseType
    };

  } catch (error) {
    console.error('Error analyzing model:', error);
    return null;
  }
}

async function analyzeSequelizeModel(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const ast = esprima.parseModule(sourceCode);
  const modelName = [];
  const attribute = [];
  const databaseType = ["MySQL"];

  // Map SQL types to our types
  const typeMapping = {
    'UUID': 'Id',
    'STRING': 'String',
    'INTEGER': 'Number',
    'BOOLEAN': 'Boolean',
    'DATE': 'Date',
  };

  try {
    // Find the sequelize.define call
    const defineCall = ast.body[0].expression.right.body.body[0].declarations[0].init;
    
    // Get model name and add 'Model' suffix
    const rawModelName = defineCall.arguments[0].value;
    modelName.push(rawModelName + 'Model');

    // Get attributes from the first argument object
    const attributes = defineCall.arguments[1].properties;
    attributes.forEach(prop => {
      const fieldName = prop.key.name;
      // Get the DataTypes.X value
      const dataType = prop.value.properties.find(p => 
        p.key.name === 'type'
      ).value.property.name;
      
      // Map SQL type to our type
      const mappedType = typeMapping[dataType] || dataType;

      attribute.push({
        name: fieldName,
        type: mappedType
      });
    });

    return {
      modelName,
      attribute,
      databaseType
    };

  } catch (error) {
    console.error('Error analyzing model:', error);
    return null;
  }
}

async function dataInModel(pathFile, typeDB="MySQL") {
  try {
    const fileModelContent = await fs_promises.readFile(pathFile, 'utf-8');
    if (typeDB === "MySQL") {
      const result = await analyzeSequelizeModel(pathFile);
      const data = {
        model: result.modelName,
        database: result.databaseType,
        attribute: result.attribute,
        // relations,
      };
      return await data;
    } else if (typeDB === "MongoDB") {
      const result = await analyzeMongooseModel(pathFile);
      const data = {
        model: result.modelName,
        database: result.databaseType,
        attribute: result.attribute,
        // relations,
      };
      return await data;
    }
  } catch (err) {
    console.error('Error reading the file:', err.message);
  }
}

async function analyzeController(filePath) {
  try {    
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const ast = esprima.parseModule(sourceCode);

    const operationName = [];
    const controllerClass = [];

    // Get controller class name from file path
    function getControllerClassName(filePath) {
      const fileName = path.basename(filePath);
      const baseName = fileName.replace('.controller.js', '');
      return baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Controller';
    }

    // Extract operation names from module.exports
    ast.body.forEach(node => {
      if (node.type === 'ExpressionStatement' && 
          node.expression.type === 'AssignmentExpression' &&
          node.expression.left.object.name === 'module' &&
          node.expression.left.property.name === 'exports') {
        
        const properties = node.expression.right.properties;
        properties.forEach(prop => {
          operationName.push(prop.key.name);
        });
      }
    });

    // Get controller class name from file path
    controllerClass.push(getControllerClassName(filePath));

    return {
      operationName,
      controllerClass
    };

  } catch (error) {
    console.error('Error analyzing controller:', filePath, error);
    throw error;
  }
}

async function dataInController(pathFile) {
  try {
    const fileControllerContent = await fs_promises.readFile(pathFile, 'utf-8');
    const result = await analyzeController(pathFile);
    
    // Create the final object
    const data = {
      controllerName: result.operationName,
      className: result.controllerClass,
    };
    return await data;
  } catch (err) {
    console.error('Error reading the file:', err.message);
  }
}

async function extractDataFromProject(projectPath, typeDB) {
  return new Promise(async (resolve, reject) => {
    const modelData = [];
    const controllerData = [];
    const routeData = [];

    // Specify the subfolders you want to include
    const targetSubfolders = ['models', 'controllers', 'routes'];
    // Read the contents of the main folder
    const subfolders = await fs_promises.readdir(projectPath);
    // Filter the subfolders to include only the target subfolders
    const filteredSubfolders = subfolders.filter((subfolder) =>
      targetSubfolders.includes(subfolder)
    );

    // Loop through subfolders
    await Promise.all(
      filteredSubfolders.map(async (subfolder) => {
        const subfolderPath = path.join(projectPath, subfolder);

        // Check if it's a directory
        const isDirectory = (
          await fs_promises.stat(subfolderPath)
        ).isDirectory();

        if (isDirectory) {
          // Read the contents of the subfolder
          const files = await fs_promises.readdir(subfolderPath);

          // Loop through the files in the subfolder
          await Promise.all(
            files.map(async (file) => {
              // You can do something with each file here
              if (file.includes('.model.js')) {
                const filePath = path.join(subfolderPath, file);
                console.log('Reading model file:', filePath);                
                const result = await dataInModel(filePath, typeDB);
                modelData.push(result);
              } else if (file.includes('.controller.js')) {
                const filePath = path.join(subfolderPath, file);
                console.log('Reading controller file:', filePath);
                const result = await dataInController(filePath);
                controllerData.push(result);
              } else if (file.includes('.route.js')) {
                const filePath = path.join(subfolderPath, file);
                console.log('Reading route file:', filePath);
                const result = await dataInRoute(filePath);
                routeData.push(result);
              }
            })
          );
        }
      })
    );
    resolve({
      modelData,
      controllerData,
      routeData,
    });
  });
}

const profile_for_nodejs = `
<packagedElement xmi:id="AAAAAAGMmYYazF13nfo=" name="UML_profile_for_NodeJs" visibility="public" xmi:type="uml:Profile">
<packagedElement xmi:id="AAAAAAGMmc+pm15OkLo=" name="Route" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVCvvZQa4=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMtN6dTFg9ixA="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVCvva+cQ=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMmc+pm15OkLo="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMtN6dTFg9ixA=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVCvvZQa4=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmdUuwV9zed8=" name="HTTPMethod" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVCvvb7hU=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMmfkBCWv/o80="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVCvvcRj0=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMmdUuwV9zed8="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMmfkBCWv/o80=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVCvvb7hU=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmdhx6F/AjOw=" name="Controller" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVCvvdWic=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMtN6oOVhOzPk="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVCvvea48=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMmdhx6F/AjOw="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMtN6oOVhOzPk=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVCvvdWic=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmdjJmGABFtE=" name="Model" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVCvvf0jw=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMtN607FhfT5Q="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVCvvg8aI=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMmdjJmGABFtE="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMtN607FhfT5Q=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVCvvf0jw=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgLI/3Kpf3A=" name="GET" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <generalization xmi:id="AAAAAAGMmgO7DXOiR3k=" visibility="public" xmi:type="uml:Generalization" specific="AAAAAAGMmgLI/3Kpf3A=" general="AAAAAAGMmdUuwV9zed8="/>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgLxTHLXFS4=" name="POST" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <generalization xmi:id="AAAAAAGMmgOvtXORM3c=" visibility="public" xmi:type="uml:Generalization" specific="AAAAAAGMmgLxTHLXFS4=" general="AAAAAAGMmdUuwV9zed8="/>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgMTNnMFpHg=" name="DELETE" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <generalization xmi:id="AAAAAAGMmgPGgnOz878=" visibility="public" xmi:type="uml:Generalization" specific="AAAAAAGMmgMTNnMFpHg=" general="AAAAAAGMmdUuwV9zed8="/>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgM/jHMzGcI=" name="PUT" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <generalization xmi:id="AAAAAAGMmgPlxHPVg88=" visibility="public" xmi:type="uml:Generalization" specific="AAAAAAGMmgM/jHMzGcI=" general="AAAAAAGMmdUuwV9zed8="/>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgNrlHNizAM=" name="PATCH" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <generalization xmi:id="AAAAAAGMmgRKFnP6RUQ=" visibility="public" xmi:type="uml:Generalization" specific="AAAAAAGMmgNrlHNizAM=" general="AAAAAAGMmdUuwV9zed8="/>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMmgYuNHQtJpU=" name="Database" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVCvvh8n4=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMtN7AQVhwLFQ="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVCvviagE=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMmgYuNHQtJpU="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMtN7AQVhwLFQ=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVCvvh8n4=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGMt9vIbknkDC0=" name="ResourcePath" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVC/vjjUM=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGMt9vWmUoQc98="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVC/vkRfw=" xmi:type="uml:ExtensionEnd" type="AAAAAAGMt9vIbknkDC0="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGMt9vWmUoQc98=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVC/vjjUM=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGNm4m4d2OgCNQ=" name="API" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVC/vlsWs=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGNm4tWemPOfdU="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVC/vm4U0=" xmi:type="uml:ExtensionEnd" type="AAAAAAGNm4m4d2OgCNQ="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGNm4tWemPOfdU=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVC/vlsWs=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGNm5lfNROkcaQ=" name="ControllerPackage" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVC/vnuec=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGNm5nWSRQxsbc="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVC/vo6qU=" xmi:type="uml:ExtensionEnd" type="AAAAAAGNm5lfNROkcaQ="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGNm5nWSRQxsbc=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVC/vnuec=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGNm5l9ehPS+rU=" name="ModelPackage" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVC/vp9cc=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGNm5nicxRCy/c="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVC/vqFxY=" xmi:type="uml:ExtensionEnd" type="AAAAAAGNm5l9ehPS+rU="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGNm5nicxRCy/c=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVC/vp9cc=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
<packagedElement xmi:id="AAAAAAGNm5mxXRQB3tc=" name="DatabasePackage" visibility="public" isAbstract="false" isFinalSpecialization="false" isLeaf="false" xmi:type="uml:Stereotype" isActive="false">
  <ownedMember xmi:id="AAAAAAGNm/uVC/vrprg=" xmi:type="uml:Extension">
    <memberEnd xmi:idref="AAAAAAGNm5nuPRRTAr8="/>
    <ownedEnd xmi:id="AAAAAAGNm/uVC/vsm2c=" xmi:type="uml:ExtensionEnd" type="AAAAAAGNm5mxXRQB3tc="/>
  </ownedMember>
  <ownedAttribute xmi:id="AAAAAAGNm5nuPRRTAr8=" xmi:type="uml:Property" name="base_Class" association="AAAAAAGNm/uVC/vrprg=">
    <type href="http://schema.omg.org/spec/UML/2.0/uml.xml#Class"/>
  </ownedAttribute>
</packagedElement>
</packagedElement>
`;

const type_for_uml = `
<packagedElement xmi:id="String_id" name="String" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Boolean_id" name="Boolean" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Integer_id" name="Integer" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Float_id" name="Float" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Date_id" name="Date" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Id_id" name="Id" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Array_id" name="Array" xmi:type="uml:DataType"/>
<packagedElement xmi:id="Number_id" name="Number" xmi:type="uml:DataType"/>
<packagedElement xmi:id="UUID_id" name="Id" xmi:type="uml:DataType"/>
`;

const core_template = `
<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmi:version="2.1" xmlns:uml="http://schema.omg.org/spec/UML/2.0" xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">
	<xmi:Documentation exporter="StarUML" exporterVersion="2.0"/>
	<uml:Model xmi:id="AAAAAAGNF26N3wz4sgM=" xmi:type="uml:Model" name="RootModel">
		<!-- <<UML_MODEL>> -->
	    <!-- <<PROFILE_NODE.JS>> -->
        <!-- <<type_for_uml>> -->
    </uml:Model>
</xmi:XMI>
`;

const type_model = [
  { String_id: 'String' },
  { Boolean_id: 'Boolean' },
  { Integer_id: 'Integer' },
  { Float_id: 'Float' },
  { Date_id: 'Date' },
  { Id_id: 'Id' },
  { Number_id: 'Number' },
  { UUID_id: 'Id' },
];

const mapMethodType = {
  GET: 'AAAAAAGMmgLI/3Kpf3A=',
  POST: 'AAAAAAGMmgLxTHLXFS4=',
  DELETE: 'AAAAAAGMmgMTNnMFpHg=',
  PUT: 'AAAAAAGMmgM/jHMzGcI=',
  PATCH: 'AAAAAAGMmgNrlHNizAM=',
};

function mapType(inputType) {
  for (const typeObj of type_model) {
    const [typeId, type] = Object.entries(typeObj)[0];
    if (type === inputType) {
      return typeId;
    }
  }
  return inputType; // Return the original type if not found in type_model
}

function generateId() {
  let lengthId = 16;
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < lengthId; i++) {
    const randomChar = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    id += randomChar;
  }
  return btoa(id);
}

function mapToID(resources) {
  const resultMapID = [];
  resources.forEach((resource) => {
    resultMapID.push({ [resource]: generateId() });
  });
  return resultMapID;
}

function mappingController(data) {
  let result = ``;
  let resultEachClass = [];
  const packaged_controller = `
  <packagedElement xmi:id="${generateId()}" name="Controller" xmi:type="uml:Package">
    <!-- <<CONTROLLER_ELEM>> -->
    <xmi:Extension extender="StarUML">
      <stereotype value="AAAAAAGNm5lfNROkcaQ="/> 
    </xmi:Extension>
  </packagedElement>
    `;
  data.forEach((element) => {
    let operationMapped = [];
    let controllerPackaged = `
            <packagedElement xmi:id="${generateId()}" name="${
      element.className[0]
    }" xmi:type="uml:Class">
            <xmi:Extension extender="StarUML">
              <stereotype value="AAAAAAGMmdhx6F/AjOw="/>
            </xmi:Extension>
                <!-- <<CONTROLLER_OPERATION>> -->
            </packagedElement>
          `;
    element.controllerName.forEach((elem) => {
      let operationMap = `<ownedOperation xmi:id="${generateId()}" name="${elem}" xmi:type="uml:Operation"/>`;
      operationMapped.push(operationMap);
    });
    const operationContent = operationMapped.join('');
    const controllerMapped = controllerPackaged.replace(
      '<!-- <<CONTROLLER_OPERATION>> -->',
      operationContent
    );
    resultEachClass.push(controllerMapped);
  });
  let resultClass = resultEachClass.join('');
  result = packaged_controller.replace(
    '<!-- <<CONTROLLER_ELEM>> -->',
    resultClass
  );
  return result;
}

function mappingRoute(data) {
  let result = ``;
  let resultEachPath = [];
  let packaged_resource = `
  <packagedElement xmi:id="${generateId()}" name="Route" xmi:type="uml:Package">
    <!-- <<RESOURCE_ELEM>> -->
    <xmi:Extension extender="StarUML">
      <stereotype value="AAAAAAGNm4m4d2OgCNQ="/> 
    </xmi:Extension>
  </packagedElement>
  `;
  const filteredDuplicate = [];
  data.forEach((element) => {
    const seenKeys = {};
    element.resource.forEach((obj) => {
      const key = obj;
      if (!seenKeys[key]) {
        seenKeys[key] = true;
        filteredDuplicate.push(obj);
      }
    });
  });

  const outputMappedID = mapToID(filteredDuplicate);
  let mapOperation = '';
  let mapRoute = '';
  let resultMappedOperation = [];
  let resultMappedRoute = [];

  outputMappedID.forEach((item) => {
    resultMappedRoute = [];
    resultMappedOperation = [];
    const uniqueCombinations = new Set();
    let packaged_route = `
    <packagedElement xmi:id="${Object.values(item)[0]}" name="${
      Object.keys(item)[0]
    }" xmi:type="uml:Class">
      <xmi:Extension extender="StarUML">
        <stereotype value="AAAAAAGMmc+pm15OkLo="/>
      </xmi:Extension>
      <!-- <<ROUTE_ELEM>> -->
    </packagedElement>
    `;

    // Mapped Route
    for (let i = 0; i < data.length; i++) {
      data[i].dependencyName.forEach((j) => {
        const combination = `${j.from}-${j.param}-${j.to}`;
        if (Object.keys(item)[0] == j.from) {
          if (!uniqueCombinations.has(combination)) {
            uniqueCombinations.add(combination);
            const supplierValue = outputMappedID.find((obj) =>
              obj.hasOwnProperty(j.to)
            )[j.to];
            mapRoute = `<ownedMember xmi:id="${generateId()}=" name="${
              j.param
            }" xmi:type="uml:Dependency" client="${
              Object.values(item)[0]
              }" supplier="${supplierValue}">
                <xmi:Extension extender="StarUML">
                  <stereotype value="AAAAAAGMt9vIbknkDC0="/>
                </xmi:Extension>
              </ownedMember>
            `;
            resultMappedRoute.push(mapRoute);
          }
        }
      });
    }
    // Mapped Operation
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].resource.length; j++) {
        if (data[i].resource[j] == Object.keys(item)[0]) {
          mapOperation = `<ownedOperation xmi:id="${generateId()}" name="${
            data[i].controllerName[j]
          }" xmi:type="uml:Operation">
            <xmi:Extension extender="StarUML">
              <stereotype value="${mapMethodType[data[i].methodName[j].toUpperCase()]}"/>
            </xmi:Extension>
          </ownedOperation>
          `;
          resultMappedOperation.push(mapOperation);
        }
      }
    }
    const concatenatedString =
      resultMappedRoute.join('') + resultMappedOperation.join('');
    packaged_route = packaged_route.replace(
      '<!-- <<ROUTE_ELEM>> -->',
      concatenatedString
    );
    resultEachPath.push(packaged_route);
  });
  result = packaged_resource.replace(
    '<!-- <<RESOURCE_ELEM>> -->',
    resultEachPath
  );
  return result;
}

function mappingModel(data) {
  let result = ``;
  let resultEachModel = [];
  let resultDB = [];
  let packaged_model = `
  <packagedElement xmi:id="${generateId()}" name="Model" xmi:type="uml:Package">
    <!-- <<MODEL_ELEM>> -->
    <xmi:Extension extender="StarUML">
      <stereotype value="AAAAAAGNm5l9ehPS+rU="/> 
    </xmi:Extension>
  </packagedElement>
  `;
  let packaged_database = `
  <packagedElement xmi:id="${generateId()}" name="Database" xmi:type="uml:Package">
    <!-- <<DATABASE_ELEM>> -->
    <xmi:Extension extender="StarUML">
      <stereotype value="AAAAAAGNm5mxXRQB3tc="/> 
    </xmi:Extension>
  </packagedElement>
  `;
  let packaged_db = `
  <packagedElement xmi:id="${generateId()}" name="${
    data[0].database[0]
  }" xmi:type="uml:Class">
    <xmi:Extension extender="StarUML">
      <stereotype value="AAAAAAGMmgYuNHQtJpU="/> 
    </xmi:Extension>
    <!-- <<DB_ELEM>> -->
  </packagedElement>`;
  let attr_db = `
  <ownedAttribute xmi:id="${generateId()}" name="${
    data[0].database[0]
  }" visibility="private" type="String_id" xmi:type="uml:Property"/>
  `;
  packaged_db = packaged_db.replace('<!-- <<DB_ELEM>> -->', attr_db);
  packaged_database = packaged_database.replace(
    '<!-- <<DATABASE_ELEM>> -->',
    packaged_db
  );
  resultDB.push(packaged_database);

  let getModelList = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].model.length; j++) {
      getModelList.push(data[i].model[j]);
    }
  }

  let mappedID = mapToID(getModelList);
  data.forEach((item) => {
    let attrMapped = [];
    let ownedMemberMapped = [];

    const idValue = mappedID.find((obj) => obj.hasOwnProperty(item.model[0]))[
      item.model[0]
    ];
    let modelPackaged = `
  <packagedElement xmi:id="${idValue}" name="${item.model[0]}" xmi:type="uml:Class">
      <xmi:Extension extender="StarUML">
        <stereotype value="AAAAAAGMmdjJmGABFtE="/> 
      </xmi:Extension>
      <!-- <<Model_MEMBER_ATTR>> -->
  </packagedElement>
  `;
    // This New feature for relation
    // item.relations.forEach((i) => {
    //   let storeEndID = generateId();
    //   let storeStartID = generateId();
    //   const idEndValue = mappedID.find((obj) => obj.hasOwnProperty(i))[i];
    //   let ownedMember = `
    //   <ownedMember xmi:id="${generateId()}" xmi:type="uml:Association">
    //     <!-- <<Model_MEMBER>> -->
    //   </ownedMember>
    //   `;
    //   let ownedStart = `
    //   <ownedEnd xmi:id="${storeStartID}" xmi:type="uml:Property" type="${idValue}" />
    //   `;
    //   let ownedEnd = `
    //     <ownedEnd xmi:id="${storeEndID}" xmi:type="uml:Property" type="${idEndValue}" />
    //   `;
    //   let memberStart = `
    //   <memberEnd xmi:idref="${storeStartID}"/>
    //   `;
    //   let memberEnd = `
    //   <memberEnd xmi:idref="${storeEndID}"/>
    //   `;
    //   let member = ownedStart + ownedEnd + memberStart + memberEnd;
    //   ownedMember = ownedMember.replace('<!-- <<Model_MEMBER>> -->', member);
    //   ownedMemberMapped.push(ownedMember);
    // });
    item.attribute.forEach((a) => {
      const mappedType = mapType(a.type);
      const outputMapped = { ...a, type: mappedType };
      let attrModel = `
      <ownedAttribute xmi:id="${generateId()}" name="${a.name}" type="${
        outputMapped.type
      }" visibility="private" xmi:type="uml:Property"/>
      `;
      attrMapped.push(attrModel);
    });
    const attrContent = ownedMemberMapped.join('') + attrMapped.join('');
    const modelMapped = modelPackaged.replace(
      '<!-- <<Model_MEMBER_ATTR>> -->',
      attrContent
    );
    resultEachModel.push(modelMapped);
  });
  let resultModel = resultEachModel.join('');
  result = packaged_model.replace('<!-- <<MODEL_ELEM>> -->', resultModel);
  let result_DB = resultDB.join('');
  return { result, result_DB };
}

async function generateXMI(data, outPath) {
  return new Promise((resolve, reject) => {
    let xmi = ``;
    const core_packaged_template = `
      <packagedElement xmi:id="${generateId()}" name="backend" xmi:type="uml:Model">
          <!-- <<PACKAGED_MODEL>> -->
          <!-- <<PACKAGED_CONTROLLER>> -->
          <!-- <<PACKAGED_DATABASE>> -->
          <!-- <<PACKAGED_RESOURCE>> -->
      </packagedElement>
      `;
    let mappedController = mappingController(data.controller);
    let mappedRoute = mappingRoute(data.route);
    let mappedModel = mappingModel(data.model);
    let mapProfileAndType = core_template.replace(
      '<!-- <<PROFILE_NODE.JS>> -->',
      profile_for_nodejs
    );
    mapProfileAndType = mapProfileAndType.replace(
      '<!-- <<type_for_uml>> -->',
      type_for_uml
    );
    let mapToCoreController = core_packaged_template.replace(
      '<!-- <<PACKAGED_CONTROLLER>> -->',
      mappedController
    );
    let mapToCoreRoute = mapToCoreController.replace(
      ' <!-- <<PACKAGED_RESOURCE>> -->',
      mappedRoute
    );
    let mapToCoreModel = mapToCoreRoute.replace(
      '<!-- <<PACKAGED_MODEL>> -->',
      mappedModel.result
    );
    let mapToCoreDb = mapToCoreModel.replace(
      '<!-- <<PACKAGED_DATABASE>> -->',
      mappedModel.result_DB
    );
    mapToCoreDb = mapProfileAndType.replace(
      '<!-- <<UML_MODEL>> -->',
      mapToCoreDb
    );
    xmi = mapToCoreDb.replace(/^\s+|\s+$/g, '');
    const fileName = outPath;
    fs.writeFileSync(fileName, xmi);
    resolve();
  });
}

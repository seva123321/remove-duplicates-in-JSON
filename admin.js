let fileListArray;

window.onload = function () {
  let fileInput = document.getElementById("fileInput");
  // let fileDisplayArea = document.getElementById("fileDisplayArea");
  const DRAGZONE = document.getElementById("DRAGZONE");
  // список разрешенных типов
  const T_ALL = ["json"];
  // const UPLOAD = document.querySelector('.drag__upload');
  const MAXSIZE = 600 * 1024 * 1024; // 600Mb но получаем в байтах

  // коллекция файлов
  let files = null;
  // let newFiles = null

  DRAGZONE.addEventListener("dragenter", function (Event) {
    Event.preventDefault();
  });

  DRAGZONE.addEventListener("dragleave", function (Event) {
    Event.preventDefault();
  });

  DRAGZONE.addEventListener("dragover", function (Event) {
    Event.preventDefault();
  });

  DRAGZONE.addEventListener("drop", function (Event) {
    Event.preventDefault();

    let newFiles = Event.dataTransfer.files;

    let jsonCheck = Array.from(newFiles).every(
      (file) => file.name.split(".").pop() == T_ALL[0]
    );

    if (jsonCheck) {
      addFilesInArray(newFiles);

      addFilesInPreview(fileListArray);

      deleteDoubleJson(fileListArray);
    } else {
      let preview = document.querySelector(".drag__preview");
      preview.innerHTML = "";
      preview.insertAdjacentHTML(
        "afterbegin",
        `
      <div class="preview__default">
          <strong>Загруженный формат файла не поддерживается</strong>
      </div>
      `
      );
    }
  });

  fileInput.addEventListener("change", function (e) {
    let newFiles = fileInput.files;

    let jsonCheck = Array.from(newFiles).every(
      (file) => file.name.split(".").pop() == T_ALL[0]
    );

    if (jsonCheck) {
      addFilesInArray(newFiles);

      addFilesInPreview(fileListArray);

      deleteDoubleJson(fileListArray);
    } else {
      let preview = document.querySelector(".drag__preview");
      preview.innerHTML = "";
      preview.insertAdjacentHTML(
        "afterbegin",
        `
        <div class="preview__default">
            <strong>Загруженный формат файла не поддерживается</strong>
        </div>
        `
      );
    }
  });

  function addFilesInArray(newFiles) {
    if (fileListArray) {
      // преобразуем объект в массив

      Array.from(newFiles).forEach((file) => {
        let add = true;

        // получили расширение файла
        let getType = file.name.split(".").pop();

        fileListArray.forEach((oldFile) => {
          // если новый файл уже был в старом массиве
          if (file.size === oldFile.size) add = false;
        });

        // если файл не найден тогда добавляем в массив
        if (add && T_ALL.includes(getType) && file.size <= MAXSIZE)
          fileListArray.push(file);
      });
    } else {
      fileListArray = Array.from(newFiles);
    }
  }

  function addFilesInPreview(filesArray) {
    const PREVIEW = document.querySelector(".drag__preview");

    // очистка
    PREVIEW.innerHTML = "";

    filesArray.forEach((file, index) => {
      // получили расширение файла
      let getType = file.name.split(".").pop();

      if (T_ALL.includes(getType)) {
        PREVIEW.insertAdjacentHTML(
          "afterbegin",
          `
                <div class="preview__default">
                  <div> ${file.name}</div>
                  <div class="btnWrapper">
                    <div class="upload-btn" >
                        <a class="btn btnSave-${index}">Save</a>
                    </div>
                    <button class="btnRemove" onclick="deleteFile(${file.size})">
                        <img class="delete-icon" src="wastebasket.svg" alt="Удалить файл" width="25">
                    </button>                   
                  </div>
                </div>
                `
        );
      }
    });
  }

  function deleteDoubleJson(filesArray) {
    let labelVal = DRAGZONE.querySelector(".fileInput-button-text").innerText;
    let countFiles = filesArray.length;
    if (countFiles) {
      DRAGZONE.querySelector(".fileInput-button-text").innerText =
        "Выбрано файлов: " + countFiles;
    } else {
      labelVal = labelVal;
    }

    filesArray.forEach((file, index) => {
      let fileName = file.name.split(".").at(0); // используем at(0) для получения имени файла

      let reader = new FileReader();
      reader.onload = function () {
        let jsonFile;
        try {
          Object.keys(JSON.parse(reader.result)).includes("data")
            ? (jsonFile = JSON.parse(reader.result).data)
            : (jsonFile = JSON.parse(reader.result));

          if (window.Worker) {
            const myWorker = new Worker("worker.js");
            myWorker.postMessage(jsonFile);
            myWorker.onmessage = function (e) {
              let unique = e.data;

              // Сохранение файла
              let fileSave = document.querySelector(`.btnSave-${index}`);
              let myData =
                "data:application/json;charset=utf-8," +
                JSON.stringify(unique, null, 2);
              fileSave.href = myData;
              fileSave.download = `${fileName}_modified.json`;
            };
          } else {
            console.log("Your browser doesn't support web workers.");
            // Удаление дубликатов в json file
            let unique = Array.from(
              new Set(jsonFile.map((item) => JSON.stringify(item)))
            ).map((item) => JSON.parse(item));

            // Сохранение файла
            let fileSave = document.querySelector(`.btnSave-${index}`);
            let myData =
              "data:application/json;charset=utf-8," +
              JSON.stringify(unique, null, 2);
            fileSave.href = myData;
            fileSave.download = `${fileName}_modified.json`;
          }
        } catch (error) {
          alert(
            `Файл ${fileName} ошибочный! \n Ошибка: ${error.name} \n ${error.message}`
          );
        }
      };

      reader.readAsText(file, "CP1251");
    });
  }
};

function jsonValid(file) {
  try {
    JSON.parse(file);
    return true;
  } catch (e) {
    return false;
  }
}

function deleteFile(fSize) {
  fileListArray.forEach((file, idx) => {
    if (file.size === fSize) {
      if (fileListArray.splice(idx, 1)) {
        document
          .querySelector(`button[onclick="deleteFile(${fSize})"]`)
          .closest(".preview__default")
          .remove();
      }
    }
  });

  let labelVal = DRAGZONE.querySelector(".fileInput-button-text");
  let countFiles = fileListArray.length;
  if (countFiles) {
    labelVal.innerText = "Выбрано файлов: " + countFiles;
  } else {
    labelVal.innerText = "Выберите файл";
  }
}

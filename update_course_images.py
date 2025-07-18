import mysql.connector
import requests
from bs4 import BeautifulSoup
import json
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def get_course_image_url(course_title):
    """
    Busca una imagen relevante para el curso usando Bing Image Search (scraping)
    """
    try:
        query = '+'.join(course_title.lower().split())
        url = f"https://www.bing.com/images/search?q={query}&form=HDRSC2&first=1&tsc=ImageBasicHover"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        image_tags = soup.find_all("a", class_="iusc")

        if image_tags:
            for tag in image_tags:
                m = json.loads(tag.get("m", "{}"))
                if "murl" in m:
                    return m["murl"]  # Imagen original
    except Exception as e:
        print(f"Error buscando imagen para {course_title}: {e}")

    # Imagen por defecto si no se encuentra nada
    return "https://via.placeholder.com/480x270.png?text=Curso"


def update_course_images():
    try:
        # Conectar a la base de datos
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'api-rest')
        )
        
        cursor = conn.cursor()
        
        # Obtener todos los cursos
        cursor.execute("SELECT id, titulo FROM cursos")
        courses = cursor.fetchall()
        
        # Actualizar cada curso
        for course in courses:
            course_id = course[0]
            course_title = course[1]
            
            # Obtener nueva URL de imagen
            new_image_url = get_course_image_url(course_title)
            
            # Actualizar la imagen en la base de datos
            update_query = "UPDATE cursos SET imagen = %s WHERE id = %s"
            cursor.execute(update_query, (new_image_url, course_id))
            
            print(f"Actualizado curso {course_title} con nueva imagen")
        
        # Confirmar los cambios
        conn.commit()
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_course_images()

# id, titulo, descripcion, instructor, imagen, precio, id_creador, created_at, updated_at
# '3', 'Programación de Android desde Cero +35 horas Curso COMPLETO', 'Aprender a programar aplicaciones y juegos para Android de forma profesional y desde cero.', 'Jose Javier Villena', 'https://img-c.udemycdn.com/course/480x270/2316450_7b49_3.jpg', '199.99', '1', NULL, '2025-06-29 12:04:13'
# '4', 'Universidad Java: De Cero a Master +82 hrs (JDK 13 update)!', 'El mejor curso para aprender Java, POO, JDBC, Servlets, JSPs, Java EE, Web Services, JSF, EJB, JPA, PrimeFaces y JAX-RS!', 'Global Mentoring', 'https://i.cloudinary/480x270/1265942_7e2f_9.jpg', '199.99', '1', NULL, NULL
# '5', 'Curso Maestro de Python 3: Aprende Desde Cero', 'Aprende a programar con clases y objetos, a usar ficheros y bases de datos SQLite, interfaces gráficas y más con Python', 'Héctor Costa Guzmán', 'https://i.cloudinary/480x270/882422_0549_9.jpg', '199.99', '1', NULL, NULL
# '6', 'Master en JavaScript: Aprender JS, jQuery, Angular 8, NodeJS', 'Master en JavaScript: Aprender JS, jQuery, Angular 8, NodeJS', 'Víctor Robles', 'https://i.cloudinary/480x270/1337000_0d99.jpg', '199.99', '1', NULL, NULL
# '10', 'PHP 7 y cloudinaryl Curso Completo, Práctico y Desde Cero !', 'HTML5, CSS3, Responsive Design, Adobe XD, SASS, JavaScript, jQuery, Bootstrap 4, WordPress, Git, GitHub', 'Carlos Arturo Esparza', 'https://i.cloudinary/480x270/672600_1def_7.jpg', '199.99', '1', NULL, NULL
# '11', 'Curso de C++: Básico a Avanzado', 'Curso diseñado para principiantes o estudiantes universitarios sin conocimientos previos del lenguaje', 'Gianmarco Tantaruna', 'https://i.cloudinary/480x270/763172_d61c_4.jpg', '199.99', '1', NULL, NULL
# '12', 'Node: De cero a experto', 'Curso diseñado para principiantes o estudiantes universitarios sin conocimientos previos del lenguaje', 'Fernando Herrera', 'https://i.cloudinary/480x270/1562070_d426.jpg', '199.99', '1', NULL, NULL
# '13', 'Master en PHP, SQL, POO, MVC, Laravel, Symfony, WordPress +', 'Aprende PHP desde cero, bases de datos, SQL, cloudinaryOO, MVC, Librerías, Laravel 5 y 6, Symfony 4 y 5, WordPress +56h', 'Víctor Robles', 'https://i.cloudinary/480x270/1438222_0ec3_4.jpg', '199.99', '1', NULL, NULL
# '14', 'Aprende Programación en C desde cero', 'Metodología, Algoritmos, Estructura de Datos y Organización de Archivos', 'Alejandro Miguel Taboada Sanchez', 'https://i.cloudinary/480x270/728634_9428_7.jpg', '199.99', '1', NULL, NULL
# '15', 'ionic 2 y ionic 3: Crea apps para Android e iOS desde cero.', 'Creemos apps para nuestros dispositivos móviles con el conocimiento que tenemos de Angular, HTML, CSS y JavaScript', 'Fernando Herrera', 'https://i.cloudinary/480x270/1145678_760a_6.jpg', '199.99', '1', NULL, NULL
# '16', 'JavaScript: de cero hasta los detalles', 'En este poderoso lenguaje de programación web cada día más utilizado', 'Fernando Herrera', 'https://i.cloudinary/480x270/751768_27d8.jpg', '199.99', '1', NULL, NULL
# '17', 'Curso de Angular 8 - Desde cero hasta profesional', 'Aprende a desarrollar aplicaciones web modernas de forma práctica y desde cero con Angular 4, 5, 6, 7 y 8 (Angular 2+)', 'Víctor Robles', 'https://i.cloudinary/480x270/1156926_b2c4_6.jpg', '199.99', '1', NULL, NULL
# '18', 'Curso completo de Machine Learning: Data Science en Python', 'Aprende los algoritmos de Machine Learning con Python para convertirte en un Data Science con todo el código para usar', 'Juan Gabriel Gomila Salas', 'https://i.cloudinary/480x270/1606018_069c.jpg', '199.99', '1', NULL, NULL
# '19', 'Flutter: Tu guía completa de desarrollo para IOS y Android', 'Push, Cámara, Mapas, REST API, SQLite, CRUD, Tokens, Storage, Preferencias de usuario, PlayStore, AppStore, Bloc y más!', 'Fernando Herrera', 'https://i.cloudinary/480x270/2306140_8181.jpg', '199.99', '1', NULL, NULL
# '20', 'Angular Avanzado: Lleva tus bases al siguiente nivel - MEAN', 'MEAN, Google Signin, JWT, carga de archivos, lazyload, optimizaciones, Git, GitHub, panel administrativo y mucho más.', 'Fernando Herrera', 'https://i.cloudinary/480x270/1420028_b32f.jpg', '199.99', '1', NULL, NULL
# '21', 'React JS + Redux + ES6. Completo ¡De 0 a experto! (español)', 'El curso de React en español más elegido. Desarrollo en forma práctica, ejemplos, fundamentos y herramientas útiles', 'Ing. Emiliano Ocariz', 'https://i.cloudinary/480x270/1374394_f1a8_2.jpg', '199.99', '1', NULL, NULL
# '22', 'Spring Framework 5: Creando webapp de cero a experto (2019)', 'Construye aplicaciones web reales con Spring Framework 5 & Spring Boot: Thymeleaf, JPA, Security, REST, Angular, WebFlux', 'Andrés José Guzmán', 'https://i.cloudinary/480x270/1388250_e9ac_6.jpg', '199.99', '1', NULL, NULL
# '23', 'GIT+GitHub: Todo un sistema de control de versiones de cero', 'No vuelvas a perder tu trabajo por cualquier tipo de problema, aprende a trabajar de una forma segura y en equipo', 'Fernando Herrera', 'https://i.cloudinary/480x270/1235212_3204_2.jpg', '199.99', '1', NULL, NULL
# '24', 'Curso de TypeScript - El lenguaje utilizado por Angular 2', 'Aprende JavaScript orientado a objetos con TypeScript el lenguaje usado en Angular 2 (nuevo y mejorado AngularJS)', 'Víctor Robles', 'https://i.cloudinary/480x270/914024_9850.jpg', '199.99', '1', NULL, NULL
# '25', 'Crea sistemas POS Inventarios y ventas con PHP 7 y AdminLTE', 'Aprende JavaScript orientado a objetos con TypeScript el lenguaje usado en Angular 2 (nuevo y mejorado AngularJS)', 'Juan Fernando Urrego', 'https://i.cloudinary/480x270/1467412_94b5_11.jpg', '199.99', '1', NULL, NULL
# '26', 'Curso de Desarrollo Web Completo 2.0', '¡Aprende haciendo! HTML5, CSS3, Javascript, jQuery, Bootstrap 4, WordPress, PHP, cloudinaryPIs, apps móviles y Python', 'Jose Luis Núñez Montes', 'https://i.cloudinary/480x270/834866_4564_2.jpg', '199.99', '1', NULL, NULL
# '27', 'Aprende Programación C# con Visual Studio desde cero.', 'Aprende una sólida base de programación con Visual Studio, C# y el Framework .NET', 'Mariano Rivas', 'https://i.cloudinary/480x270/797188_b203_5.jpg', '199.99', '1', NULL, NULL
# '28', 'Bootstrap 4: El Curso Completo, Práctico y Desde Cero', 'Aprende a crear cualquier sitio web adaptable a dispositivos móviles con Boostrap 4, el mejor framework de diseño web', 'Carlos Arturo Esparza', 'https://i.cloudinary/480x270/1245130_efdb_5.jpg', '199.99', '1', NULL, NULL
# '29', 'Desarrollo Web con Spring Boot - De Cero a Ninja', 'El curso definitivo de Spring Framework 4.3 desde cero: Spring Boot + Rest + MVC + Security + Data JPA + Thymeleaf', 'Miguel A. M.', 'https://i.cloudinary/480x270/984636_5a01_8.jpg', '199.99', '1', NULL, NULL
# '30', 'iOS y Swift : Curso Completo de Cero a Profesional', 'Aprende a Desarrollar Apps Móviles para iPhone y iPad en Swift Desde Cero con el Mejor Curso de iOS y Swift en Español.', 'Juan Villalvazo', 'https://i.cloudinary/480x270/1242552_1235_4.jpg', '199.99', '1', NULL, NULL
# '31', 'Crea sistemas Ecommerce con PHP 7 con pagos de PAYPAL y PAYU', 'Aprende a crear tu propio ecosistema de comercio electrónico con PHP 7 usando AdminLTE y recibe pagos con PAYPAL y PAYU', 'Juan Fernando Urrego', 'https://i.cloudinary/480x270/1322574_f1bd_10.jpg', '199.99', '1', NULL, NULL
# '32', 'Fundamentos de Programación', 'Aprende las Bases de la Programación en 9 lenguajes a la vez: Java, Python, Go, C++, PHP, Ruby, C#, JavaScript y C', 'Jose Javier Villena', 'https://i.cloudinary/480x270/1192848_e63a.jpg', '199.99', '1', NULL, NULL
# '33', 'ionic 5: Crear aplicaciones IOS, Android y PWAs con Angular', 'Google Play Store, Apple App Store, PWAs, Push Notifications, despliegues en la web, tabletas y mucho más', 'Fernando Herrera', 'https://i.cloudinary/480x270/2088520_5480.jpg', '199.99', '1', NULL, NULL
# '34', 'Curso Completo de iOS 10 y Swift 3: de Cero a Experto con JB', 'El Curso más actualizado de iOS 10 y Swift 3 en español. Desarrollo completo de apps móviles para iPhone y iPad en Swift', 'Juan Gabriel Gomila Salas', 'https://i.cloudinary/480x270/883176_ad3a_4.jpg', '199.99', '1', NULL, NULL
# '35', 'Desarrollo de sistemas web en PHP 7 POO, cloudinaryquery Ajax', 'Diseña sistemas web en PHP Orientado Objetos, MariaDB (cloudinaryJquery Ajax, HTML5 CSS3 Bootstrap INCLUYE PROYECTO FINAL', 'Juan Carlos Arcila Díaz', 'https://i.cloudinary/480x270/1149390_0753_5.jpg', '199.99', '1', NULL, NULL
# '36', 'Desarrollo web con JavaScript, Angular, NodeJS y MongoDB', 'Aprende a desarrollar una webapp como Spotify usando el MEAN Stack (Node, MongoDB, Express, JWT y Angular 4, 5, 6, 7, 8)', 'Víctor Robles', 'https://i.cloudinary/480x270/1023976_d8a0_9.jpg', '199.99', '1', NULL, NULL
# '37', 'Dominando Laravel - De principiante a experto', 'Aprende a crear aplicaciones robustas y escalables con el framework más popular de PHP, Laravel', 'Jorge García', 'https://i.cloudinary/480x270/1126742_f0d3_3.jpg', '199.99', '1', NULL, NULL
# '38', 'Aprender a programar con Java. De cero hasta hacer sistemas', '¡Ahora con JavaFX! Aprende conceptos básicos de programación hasta el desarrollo de un sistema completo con Java.', 'Javier Arturo Vázquez Olivares', 'https://i.cloudinary/480x270/908106_359a_2.jpg', '199.99', '1', NULL, NULL
# '39', 'Java y BlueJ | Introducción a las Bases de la Programación', 'Curso Básico introductorio del lenguaje Java para personas que no saben programar aún.', 'Javier Arturo Vázquez Olivares', 'https://i.cloudinary/480x270/948840_f991.jpg', '199.99', '1', NULL, NULL
# '40', 'Crea tu Tienda Online Sin Inventario y Aprende Dropshipping', 'Aprende Dropshipping, Crea tu Tienda Online, Lanzate al mercado y obtén tus primeras ventas sin Comprar inventario!', 'Rodrigo Martinez Blanco', 'https://i.cloudinary/480x270/546338_4f43_3.jpg', '199.99', '1', NULL, NULL
# '41', 'Aprende Programación en C++ (Básico - Intermedio - Avanzado)', 'Si eres un apasionado de la programación, este curso te interesa. aprenderás desde las bases hasta lo avanzado en C++', 'Alejandro Miguel Taboada Sanchez', 'https://i.cloudinary/480x270/484388_ab1c_2.jpg', '199.99', '1', NULL, NULL
# '42', 'Curso Completo de Desarrollo ASP.NET MVC', 'Crea aplicaciones web fácilmente con .Net Framework', 'Ángel Arias', 'https://i.cloudinary/480x270/1209326_ca41_6.jpg', '199.99', '1', NULL, NULL
# '43', 'Git y GitHub Completo Desde Cero', 'Aprende Git y GitHub de forma completa y desde cero. Con ejemplos prácticos. Sé un profesional del control de versiones.', 'Jose Javier Villena', 'https://i.cloudinary/480x270/940740_4db9_4.jpg', '199.99', '1', NULL, NULL
# '44', 'Curso Completo Python 3 - Desde las Bases hasta Django', 'Django,Flask,Bases del lenguaje, Programación Orientada a Objetos, Lectura y Escritura de Archivos y Bases de Datos', 'Aldo Olivares', 'https://i.cloudinary.com/course/480x270/1114896_e264_3.jpg', '199.99', '1', NULL, NULL
# '45', 'React - La Guía Completa - Hooks Redux Context +15 Proyectos', 'Incluye React Hooks, Cloud Firestore, Redux, React Router, NextJS, Axios, REST API\'s, Seguridad, Autenticación y CRUDS!', 'Juan Pablo De la torre Valdez', 'https://i.cloudinary/480x270/1756340_0543_4.jpg', '199.99', '1', NULL, NULL
# '46', 'Curso completo de Machine Learning: Data Science con Rstudio', 'Aprende a analizar datos estadísticos con los trucos de Juan Gabriel Gomila, prof. de Universidad de las Islas Baleares', 'Juan Gabriel Gomila Salas', 'https://i.cloudinary/480x270/1483710_7395_2.jpg', '199.99', '1', NULL, NULL
# '47', 'Desarrollo Profesional de Temas y Plugins de WordPress', 'Aprende a crear Temas, Plugins y Bloques de Gutenberg con este curso práctico CREA SITIOS 100% DINAMICOS en WordPress', 'Juan Pablo De la torre Valdez', 'https://i.cloudinary/480x270/378726_c37d_5.jpg', '199.99', '1', NULL, NULL
# '48', 'Máster en PHP 7+, POO, MVC, cloudinaryaravel 6+, CodeIgniter 4', '¡Aprende PHP y cloudinarysde cero y crea tu propio CMS y API REST, usando los Framework de Laravel 6+ y CodeIgniter 4!', 'Juan Fernando Urrego', 'https://i.cloudinary/480x270/970528_f38a_3.jpg', '199.99', '1', NULL, NULL
# '49', 'Desarrollo de Aplicaciones móviles Android con App Inventor', '¡Crea increíbles aplicaciones móviles para Android sin programar utilizando App Inventor! 33 apps paso a paso', 'Jose Luis Núñez Montes', 'https://i.cloudinary/480x270/486808_1e8f_2.jpg', '199.99', '1', NULL, NULL
# '50', 'SQL. Curso completo de SQL. Aprende desde cero.', 'Aprende SQL desde cero para saber manejar cualquier base de datos', 'Redait Media', 'https://i.cloudinary/480x270/2137076_bbdf_4.jpg', '199.99', '1', NULL, NULL
# '51', 'AngularJS - Desde Hola Mundo hasta una Aplicación', 'Aprende como crear aplicaciones web con esta increíble herramienta de desarrollo potenciada por Google, AngularJS.', 'Fernando Herrera', 'https://i.cloudinary/480x270/467470_b749_3.jpg', '199.99', '1', NULL, NULL
# '52', 'Aprende Programación en Java (de Básico a Avanzado)', 'En este curso Aprenderás a programar en el lenguaje de programación Java, con un curso 30% teórico, 70% practico.', 'Alejandro Miguel Taboada Sanchez', 'https://i.cloudinary/480x270/802946_e81d.jpg', '199.99', '1', NULL, NULL
# '53', 'Curso Práctico de Django: Aprende Creando 3 Webs', 'Curso Práctico de Django: Aprende Creando 3 Webs', 'Héctor Costa Guzmán', 'https://i.cloudinary/480x270/1444542_d3b8_3.jpg', '199.99', '1', NULL, NULL
# '54', 'Master Unreal Engine 4 Desarrollo Videojuegos con Blueprints', 'Aprende a crear Videojuegos AAA DESDE CERO, desarrollo y programación completo con Blueprints y Unreal Engine 4', 'Mariano Rivas', 'https://i.cloudinary/480x270/1223302_ae33.jpg', '199.99', '1', NULL, NULL
# '55', 'Curso de Angular 2 en Español - Crea webapps desde cero', 'Aprende a desarrollar aplicaciones web modernas de forma práctica y desde cero con Angular 2, el sucesor de AngularJS', 'Víctor Robles', 'https://i.cloudinary/480x270/707908_13d1_3.jpg', '199.99', '1', NULL, NULL
# '56', 'Crea sistemas web ASP. Net Core 3.0 MVC, Entity Framework', 'Diseña aplicaciones web en ASP. Net Core 3 MVC y Entity Framework Core, utilizando jquery, AJAX - INCLUYE PROYECTO FINAL', 'Juan Carlos Arcila Díaz', 'https://i.cloudinary/480x270/1319300_052f_4.jpg', '199.99', '1', NULL, NULL
# '57', 'JavaScript Moderno Guía Definitiva Construye +15 Proyectos', 'Aprende el lenguaje de programación web más popular paso a paso Con Proyectos, inc. Electron React MongoDB Node Express', 'Juan Pablo De la torre Valdez', 'https://i.cloudinary/480x270/1509816_dff8.jpg', '199.99', '1', NULL, NULL
# '58', 'Angular: El mejor curso de Angular. De Cero a Experto!', 'Domina Angular 2 (Angular 8) y crea aplicaciones web del mundo real con TypeScript, Firebase, Cloud Firestore, JWT y más', 'Global Mentoring', 'https://i.cloudinary/480x270/2105384_9a0f_8.jpg', '199.99', '1', NULL, NULL
# '59', 'PWA - Aplicaciones Web Progresivas: De cero a experto', 'Notificaciones PUSH, sincronización sin conexión, modos offline, instalaciones, indexedDB, push server, share y más', 'Fernando Herrera', 'https://i.cloudinary/480x270/1894936_31a7.jpg', '199.99', '1', NULL, NULL
# '60', 'Aprende a crear tu primer sitio web con Laravel 5.4', 'Curso introductorio a Laravel PHP', 'Jorge García', 'https://i.cloudinary/480x270/1104380_304c_5.jpg', '199.99', '1', NULL, NULL
# '84', 'curso php', 'el mejor curso de php', 'luis ', 'https://formatalent.com/wp-content/uploads/2018/05/PHP-420x277.jpg', '22', '1', '2022-06-25 08:42:01', '2022-06-25 08:42:01'
# '85', 'curso php master web base de datos', 'el mejor curso de php U', 'luis coderU', 'https://formatalent.com/wp-content/uploads/2018/05/PHP-420x277.jpgU', '222', '1', '2022-06-26 19:38:19', '2022-06-26 19:38:19'
# '86', 'curso php master web y gestion de bases ', 'el mejor curso de php UU', 'luis coderUU', 'https://formatalent.com/wp-content/uploads/2018/05/PHP-420x277.jpgUU', '222', '1', '2022-06-26 19:38:51', '2022-06-26 19:38:51'
